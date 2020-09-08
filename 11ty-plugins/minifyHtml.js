const minify = require('html-minifier').minify;
const Debug = require('debug');
const debug = Debug('Dyve:minify-html');

const dev = String(process.env.NODE_ENV).toLowerCase() === 'development';

const minifyHtml = async function(content, outputPath) {
    // minify Html
    if(!outputPath.endsWith('.html') || dev || !content)
        return content;
    
    debug(outputPath);
    return minify(content, {
        removeAttributeQuotes: false,
        collapseWhitespace: true
    });
};

module.exports = {
    initArguments: {},
    configFunction: async (eleventyConfig, pluginOptions = {}) => {
        eleventyConfig.addTransform("minifyHtml", minifyHtml);
    },
};