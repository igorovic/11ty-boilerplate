const url = require('url');
const fs = require('fs');
const path = require('path');
const minifyHtml = require('./11ty-plugins/minifyHtml');
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const json5 = require('json5');
const flatted = require('flatted');
const postCSS = require('./11ty-plugins/postcss');
const injectStyles = require('./11ty-plugins/injectStyles');
const injectTailwind = require('./11ty-plugins/injectTailwind');
const cleanHtml = require('./11ty-plugins/cleanHtml');
const stencilHydrate = require('./11ty-plugins/stencilHydrate');
/* const Debug = require('debug');
const { debug } = require('console'); */


const dev = process.env.NODE_ENV === 'development';

function selectivBuild(){
    return 'src/pages';
}

module.exports = function(eleventyConfig) {
    try{
        eleventyConfig.setDataDeepMerge(true);
        eleventyConfig.addPlugin(pluginRss);

        eleventyConfig.addPlugin(stencilHydrate);
        eleventyConfig.addPlugin(injectTailwind, {url: '/styles/tailwind.css'});
        eleventyConfig.addPlugin(injectStyles);

        eleventyConfig.addPlugin(minifyHtml);
        eleventyConfig.addPlugin(cleanHtml);

        eleventyConfig.addPlugin(postCSS);

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

        eleventyConfig.addShortcode("stencil", function(namespace) {
            const ns = url.parse(namespace).hostname.replace('.', '-');
            const stencil = `
            <script type="module" src="/build/${ns}.esm.js"></script>
            <script nomodule src="/build/${ns}.js"></script>`;
            return stencil;
        });
        
        eleventyConfig.addPassthroughCopy("src/static");
        //eleventyConfig.addPassthroughCopy("src/styles");
    }catch(err){
        console.log('.elenventy.js imported outside Eleventy!');
    }
    return {
        dir: {
            input: selectivBuild(),
            includes: "../includes",
            data: "../data",
            output: "public"
        },
        templateFormats: ["njk"],
    }
  };