const fs = require('fs-extra');
const path = require('path');
const { readdirSync } = require('fs');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const cssnano = require('cssnano');
const sass = require('node-sass');
const tailwindcss = require('tailwindcss');
const debug = require('debug')('Dyve:postcss')
const debugPlugins = debug.extend('plugins');

const dev = String(process.env.NODE_ENV).toLowerCase() === 'development';

/*
** TODO: files imported from an .scss should not be transpiled. Currently they are
** event if the import works.
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


const plugins = [
    tailwindcss('./tailwind.config.js'), 
    !dev ? cssnano({preset: 'default'}) : ()=> {null},
    autoprefixer({env: 'last 6 version'})
]

debugPlugins('plugins: %O', plugins)

const defaultOptions = {
    outDir: 'public/styles',
    srcDir: 'src/styles',
    files: [],
    tailwindcss: {
        src: require.resolve('tailwindcss/tailwind.css'),
        dest: 'public/styles'
    }
}

function postCss(_, options = defaultOptions){
    let styleFiles = WalkSync(options.srcDir)
                    .map(f => path.posix.normalize(path.join(options.srcDir, f)))
    styleFiles = styleFiles.concat(options.files)
    debug('styles: %O', styleFiles);
    for(const style of styleFiles){
        let dest = path.join(options.outDir, style.replace(path.normalize(options.srcDir), ''));
        
        if(path.extname(dest) !== '.css')
            dest = path.join(path.dirname(dest), path.basename(dest, path.extname(dest))+'.css');

        if(options.files.includes(style)){
            dest = path.join(options.outDir, path.basename(style, path.extname(style))+'.css')
        }
        debug('dest:', dest)
        fs.readFile(style, 'utf-8', (err, css) => {
            if(err){
                console.error(err);
            }else{
                if(style.endsWith('.scss')){
                    let processed = sass.renderSync({data: css, includePaths: [ options.srcDir ]});
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
    if(options.tailwindcss && options.tailwindcss.src){
        const dest = options.tailwindcss.dest ? path.join(options.tailwindcss.dest, 'tailwind.css') : path.join(options.outDir, 'tailwind.css');
        const style = options.tailwindcss.src;
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