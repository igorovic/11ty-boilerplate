const url = require('url');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const minify = require('html-minifier').minify;
const { renderToString } = require('./dist/hydrate');
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const json5 = require('json5');
const flatted = require('flatted');
const postCSS = require('./11ty-plugins/postcss');

const dev = process.env.NODE_ENV === 'development';

function selectivBuild(){
    return 'src/pages';
}

module.exports = function(eleventyConfig) {
    try{
        eleventyConfig.addPlugin(pluginRss);
        
        eleventyConfig.addTransform("stencil-hydrate", async function(content, outputPath) {
            if(path.extname(outputPath) !== '.html')
                return content;
            const { html } = await renderToString(content, {
                prettyHtml: true,
                removeScripts: false
            })
            //console.log('hydrate ', outputPath);
            return html;
        });

        eleventyConfig.addTransform("tailwind-inject", async function(content, outputPath) {
            // inject tailwind.css in <head>
            if(path.extname(outputPath) !== '.html' || (this.frontMatter.data && this.frontMatter.data.tailwind === false))
                return content;
            const dom = new JSDOM(content);
            let sc = dom.window.document.createElement("link");
            sc.setAttribute("rel", "stylesheet");
            sc.setAttribute("href", "/styles/tailwind.css");
            dom.window.document.head.appendChild(sc);
            //console.log('inject tailwind.css', outputPath);
            return dom.serialize();
        });

        eleventyConfig.addTransform("minify-html", async function(content, outputPath) {
            // inject tailwind.css in <head>
            if(path.extname(outputPath) !== '.html' || dev)
                return content;
            return minify(content, {
                removeAttributeQuotes: false,
                collapseWhitespace: true
            });
        });

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
        }
    }
  };