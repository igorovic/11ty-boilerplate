const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginTailwind = require("eleventy-plugin-tailwindcss");
const json5 = require('json5');
const flatted = require('flatted');


const dev = process.env.NODE_ENV === 'development'

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(pluginRss);
    /* eleventyConfig.addPlugin(pluginTailwind, {
        src: ["src/tailwind.css"],
        excludeNodeModules: true,
        dest: "styles",
        keepFolderStructure: false,
        configFile: "./tailwind.config.js",
        autoprefixer: true,
        autoprefixerOptions: {},
        minify: !dev,
        minifyOptions: {}
    }); */
    //console.log(eleventyConfig);

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
    return {
        dir: {
            input: "src/pages",
            includes: "../includes",
            data: "../data",
            output: "public"
        }
    }
  };