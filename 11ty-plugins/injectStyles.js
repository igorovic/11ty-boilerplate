const fs = require('fs');
const path = require('path');
const colors = require('colors');
const posthtml = require ("posthtml");

const Debug = require('debug');
const debug = Debug('Dyve:injectStyles')

const dev = process.env.NODE_ENV === 'development';


const injectStyles = async function(content, outputPath) {
    // inject stylesheets in <head>
    if(path.extname(outputPath) !== '.html' || (this.frontMatter.data && !this.frontMatter.data.styles))
        return content;
    
    let styles = []
    if(Array.isArray(this.frontMatter.data.styles))
        styles = this.frontMatter.data.styles;
    else if (typeof this.frontMatter.data.styles === 'string')
        styles = [this.frontMatter.data.styles]
    else {
        console.error('frontMatter `styles` must be an Array of strings for'.red, colors.red(outputPath));
        return content;
    }
    const injectStylesheet = (tree) =>{
        debug(outputPath, styles);
        return new Promise((resolve) => {
            tree.match({ tag: 'head' }, (node) => {
                styles.forEach((styleFile) => {
                    if(fs.existsSync(path.join('public', styleFile))){
                        node.content.push('\n');
                        node.content.push({
                            tag: 'link',
                            attrs: {
                                rel: 'stylesheet',
                                href: styleFile
                            }
                        })
                        node.content.push('\n');
                    }
                })
                return node;
            })
            resolve(tree)
        })
    }
    let result = content;
    const R = await posthtml([
        injectStylesheet
    ])
    .process(content);
    result = R.html;
    return result;
};

module.exports = {
    initArguments: {},
    configFunction: async (eleventyConfig, pluginOptions = {}) => {
        eleventyConfig.addTransform("injectStyles", injectStyles);
    },
};