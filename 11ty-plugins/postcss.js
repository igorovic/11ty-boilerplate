const fs = require('fs-extra');
const path = require('path');
const { readdirSync } = require('fs');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const cssnano = require('cssnano');
const sass = require('node-sass');
const tailwindcss = require('tailwindcss');
const minimatch = require("minimatch");
const debug = require('debug')('Dyve:postcss')
const debugPlugins = debug.extend('plugins');
const debugExcludes = debug.extend('excludes');

const dev = String(process.env.NODE_ENV).toLowerCase() === 'development';

const defaultOptions = {
    outDir: 'public/styles',
    srcDir: 'src/styles',
    files: [],
    tailwindcss: {
        src: require.resolve('tailwindcss/tailwind.css'),
        dest: 'public/styles'
    },
    exclude: []
}

let _pluginOptions = {...defaultOptions}
/*
** TODO: files imported from an .scss should not be transpiled. Currently they are
** even if the import works.
*/ 
function WalkSync(Path, prefix, options={ignoreDirs: false}){
    let Files = [];
    try{
        let Listing = readdirSync(Path, {withFileTypes: true});
        
        Listing.forEach(item => {
            if(!item.isDirectory()){
                Files.push(prefix ? path.join(prefix, item.name) : item.name)
            }else{
                if( !options.ignoreDirs ){
                    Files = Files.concat(WalkSync(path.join(Path, item.name), item.name));
                }
            }
        })
    }catch(err){
        console.error(err.message);
    }
    return Files;
};


function filterExcludes(FilesList){
    let filtered = [...FilesList]
    let excludes;
    if(typeof _pluginOptions.exclude === 'string')
        excludes = [_pluginOptions.exclude]
    else
        excludes = [..._pluginOptions.exclude]

    for( let pattern of excludes){
        debugExcludes(pattern)
        pattern = path.normalize(pattern)
        filtered = filtered.filter(minimatch.filter(pattern, {matchBase: true, nocase: true}))
    }
    return FilesList.filter(f => !filtered.includes(f));
}


const plugins = [
    tailwindcss('./tailwind.config.js'), 
    !dev ? cssnano({preset: 'default'}) : ()=> {null},
    autoprefixer({env: 'last 6 version'})
]

debugPlugins('plugins: %O', plugins)



function postCss(_, options = defaultOptions){
    _pluginOptions = {...defaultOptions, ...options}

    let styleFiles = WalkSync(_pluginOptions.srcDir)
                    .map(f => path.posix.normalize(path.join(_pluginOptions.srcDir, f)))
    styleFiles = filterExcludes(styleFiles);
    styleFiles = styleFiles.concat(_pluginOptions.files)
    debug('styles: %O', styleFiles);
    for(const style of styleFiles){
        let dest = path.join(_pluginOptions.outDir, style.replace(path.normalize(_pluginOptions.srcDir), ''));
        
        if(path.extname(dest) !== '.css')
            dest = path.join(path.dirname(dest), path.basename(dest, path.extname(dest))+'.css');

        if(_pluginOptions.files.includes(style)){
            dest = path.join(_pluginOptions.outDir, path.basename(style, path.extname(style))+'.css')
        }
        debug('dest:', dest)
        fs.readFile(style, 'utf-8', (err, css) => {
            if(err){
                console.error(err);
            }else{
                if(style.endsWith('.scss')){
                    let processed = sass.renderSync({data: css, includePaths: [ _pluginOptions.srcDir ]});
                    css = processed.css;
                }
                postcss(plugins)
                    .process(css, { from: style, to: dest })
                    .then(result => {
                        fs.outputFile(result.opts.to, result.css, () => true)
                        if ( result.map ) {
                            fs.outputFile(result.opts.to+'.map', result.map, () => true)
                        }
                    })
            }
        })
    }
    if(_pluginOptions.tailwindcss && _pluginOptions.tailwindcss.src){
        const dest = _pluginOptions.tailwindcss.dest ? path.join(_pluginOptions.tailwindcss.dest, 'tailwind.css') : path.join(_pluginOptions.outDir, 'tailwind.css');
        const style = _pluginOptions.tailwindcss.src;
        fs.readFile(style, (err, css) => {
            if(err){
                console.error(err);
            }else{
                postcss(plugins)
                    .process(css, { from: style, to: dest })
                    .then(result => {
                        fs.outputFile(result.opts.to, result.css, () => true)
                        if ( result.map ) {
                            fs.outputFile(result.opts.to+'.map', result.map, () => true)
                        }
                    })
            }
        })
    }
}

module.exports = postCss;