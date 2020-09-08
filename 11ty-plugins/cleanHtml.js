const pretty = require('pretty');
const Debug = require('debug');
const debug = Debug('Dyve:cleanHtml');

const dev = process.env.NODE_ENV === 'development';

const cleanHtml = async function(content, outputPath) {
    // clean Html if in dev mode
    if(!outputPath.endsWith('.html') || !dev || !content)
        return content;
    
    try{
        const html = pretty(content);
        debug(outputPath);
        return html;
    }catch(err){
        console.error(err);
    }
    debug('only reach this point if failed');
    return content;
};

module.exports = {
    initArguments: {},
    configFunction: async (eleventyConfig, pluginOptions = {}) => {
        eleventyConfig.addTransform("cleanHtml", cleanHtml);
    },
};