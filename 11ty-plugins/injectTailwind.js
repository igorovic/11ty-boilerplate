const path = require('path');
const posthtml = require ("posthtml");

const Debug = require('debug');
const debug = Debug('Dyve:injectTailwindcss')

const dev = String(process.env.NODE_ENV).toLowerCase() === 'development';
let _pluginOptions = {};

/*
**  add tailwind: false in frontMatter to disable tailwind styles for a certain page
*/
const injectTailwind = async function(content, outputPath) {
    // inject tailwind.css in <head>
    if(path.extname(outputPath) !== '.html' || (this.frontMatter.data && this.frontMatter.data.tailwind === false))
        return content;

    const injectStylesheet = (tree) =>{
        debug('inject in: %s - href: %s', outputPath, _pluginOptions.url || '/styles/tailwind.css');
        return new Promise((resolve) => {
            tree.match({ tag: 'head' }, (node) => {
                //fs.exists('../src/tailwind.css', ()=>{
                    node.content.push('\n');
                    node.content.push({
                        tag: 'link',
                        attrs: {
                            rel: 'stylesheet',
                            href: _pluginOptions.url || '/styles/tailwind.css'
                        }
                    })
                    node.content.push('\n');
                //})
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
    
   /*  fs.exists('./src/tailwind.css', ()=>{
        const dom = new JSDOM(content);
        let sc = dom.window.document.createElement("link");
        sc.setAttribute("rel", "stylesheet");
        sc.setAttribute("href", "/styles/tailwind.css");
        dom.window.document.head.appendChild(sc);
        debug(outputPath);
        return dom.serialize();
    })
    return content; */
};

module.exports = {
    initArguments: {},
    configFunction: async (eleventyConfig, pluginOptions = {}) => {
        _pluginOptions = pluginOptions;
        eleventyConfig.addTransform("injectTailwind", injectTailwind);
    },
};