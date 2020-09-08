
const Debug = require('debug');
const debug = Debug('Dyve:stencilHydrate');

const stencilHydrate = async function(content, outputPath) {
    // early exit
    if(!outputPath.endsWith('.html'))
        return content;

    try{
        const { renderToString } = require('../dist/hydrate');
        const { html } = await renderToString(content, {
            prettyHtml: true,
            removeScripts: false
        })
        debug(outputPath);
        return html;
    }catch(err){
        console.error(err);
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