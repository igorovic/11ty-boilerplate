const dotenv = require('dotenv')
const Debug = require('debug');
const debug = Debug('Dyve:dotenv');

const dotEnv =  function() {
    let result = {}
    try{
        result = dotenv.config();
        debug('dotenv: %O', result);
        if (result.error) {
            throw result.error
        }
        return result.parsed;
    }catch(err){
        console.error(err);
    }
    return result;
};

module.exports = {
    initArguments: {},
    configFunction: async (eleventyConfig, pluginOptions = {}) => {
        eleventyConfig.addCollection("dotenv", dotEnv);
    },
};