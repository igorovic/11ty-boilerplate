const dotenv = require('dotenv');
const colors = require('colors');
const Debug = require('debug');
const debug = Debug('Dyve:dotenv');

const dotEnv =  function() {
    let result = {}
    try{
        result = dotenv.config();
        if (result.error) {
            throw result.error
        }
        debug('dotenv: %O', result);
        return result.parsed;
    }catch(err){
        console.error('11ty plugin dotenv: '.red, colors.red(err.message));
    }
    return result;
};

module.exports = {
    initArguments: {},
    configFunction: async (eleventyConfig, pluginOptions = {}) => {
        eleventyConfig.addCollection("dotenv", dotEnv);
    },
};