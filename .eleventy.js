try{
    require('dotenv').config()
}catch(err){ null }

const colors = require('colors');
const json5 = require('json5');
const flatted = require('flatted');
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const minifyHtml = require('./11ty-plugins/minifyHtml');
const postCSS = require('./11ty-plugins/postcss');
const injectStyles = require('./11ty-plugins/injectStyles');
const injectTailwind = require('./11ty-plugins/injectTailwind');
const cleanHtml = require('./11ty-plugins/cleanHtml');
const stencilHydrate = require('./11ty-plugins/stencilHydrate');
const dotEnv = require('./11ty-plugins/dotenv');


const dev = process.env.NODE_ENV === 'development';

const DEFAULT_SOURCE = 'src/pages';

function selectivBuild(srcDefault){
    return srcDefault;
}

module.exports = function(eleventyConfig) {
    try{
        eleventyConfig.setDataDeepMerge(true);
        eleventyConfig.addPlugin(pluginRss);

        eleventyConfig.addPlugin(dotEnv);
        eleventyConfig.addPlugin(stencilHydrate);
        eleventyConfig.addPlugin(injectTailwind, {url: '/styles/tailwind.css'});
        eleventyConfig.addPlugin(injectStyles);

        eleventyConfig.addPlugin(minifyHtml);
        eleventyConfig.addPlugin(cleanHtml);

        eleventyConfig.addPlugin(postCSS, {exclude: 'src/styles/l2/**/*'});

        eleventyConfig.addFilter("readableDate", dateObj => {
            return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
        });
        // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        eleventyConfig.addFilter('htmlDateString', (dateObj) => {
            return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
        });

        eleventyConfig.addFilter('json5', (obj) => {
            return json5.stringify(obj, null, 2);
        });

        eleventyConfig.addFilter('flatted', (obj) => {
            const getCircularReplacer = () => {
                const seen = new WeakSet();
                return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                    return;
                    }
                    seen.add(value);
                }
                return value;
                };
            };
            return flatted.stringify(obj, getCircularReplacer(), 2);
        });

        eleventyConfig.addFilter('ObjectKeys', (obj) => {
            return Object.keys(obj);
        });
        
        eleventyConfig.addPassthroughCopy("src/static");
        //eleventyConfig.addPassthroughCopy("src/styles");
    }catch(err){
        console.info(colors.green('.elenventy.js imported outside Eleventy!'));
    }
    return {
        dir: {
            input: selectivBuild() || DEFAULT_SOURCE,
            includes: "../includes",
            data: "../data",
            output: "public"
        },
        templateFormats: ["njk"],
    }
  };