/*
**  Injects stencil loaders scripts in the page's <head> and hydrates Web components
*/
const posthtml = require ("posthtml");
const colors = require('colors');
const Debug = require('debug');
const debug = Debug('Dyve:stencilHydrate');

function stencilEnabled(current){
    if(current.frontMatter && current.frontMatter.data && current.frontMatter.data.stencil)
        return current.frontMatter.data.stencil;
    return false;
}

let namespace = '_namespace_fallback_';

const injectStencilScripts = (tree) =>{
    return new Promise((resolve) => {
        tree.match({ tag: 'head' }, (node) => {
            node.content.push('\n');
            node.content.push({
                tag: 'script',
                attrs: {
                    type: 'module',
                    src: `/build/${namespace}.esm.js`
                }
            })
            node.content.push('\n');
            node.content.push({
                tag: 'script',
                attrs: {
                    nomodule: null,
                    src: `/build/${namespace}.js`
                }
            })
            node.content.push('\n');
            return node;
        })
        resolve(tree)
    })
}

const stencilHydrate = async function(content, outputPath) {
    // early exit
    if(!outputPath.endsWith('.html') || !stencilEnabled(this))
        return content;

    try{
        const { renderToString } = require('../dist/hydrate');
        let result = content;
        try{
            try{
                namespace = this.dataCache.metadata.stencil.namespace;
            }catch(err){
                console.error( colors.red(err.message))
                console.info(colors.yellow('Make sure you have defined a global datasource metadata.stencil.namespace'))
            }
            const R = await posthtml([
                injectStencilScripts
            ])
            .process(content);
            result = R.html;
        }catch(err){
            console.error('ERROR injecting stencil scripts'.red, colors.red(err.message));
        }

        const { html } = await renderToString(result, {
            prettyHtml: true,
            removeScripts: false
        })
        debug(outputPath);
        return html;
    }catch(err){
        console.error(colors.red(err.message));
    }
    debug('FAILED');
    return content;
};

module.exports = {
    initArguments: {},
    configFunction: async (eleventyConfig, pluginOptions = {}) => {
        eleventyConfig.addTransform("stencilHydrate", stencilHydrate);
    },
};