const fs = require('fs-extra');
const path = require('path');
const { readdirSync } = require('fs');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const cssnano = require('cssnano');
const tailwindcss = require('tailwindcss');
const debug = require('debug')('11ty-plugins-postcss')

const dev = process.env.NODE_ENV === 'development';

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

const defaultOptions = {
    outDir: 'public/styles',
    srcDir: 'src/styles',
    files: [
        'src/tailwind.css'
    ]
}

function postCss(_, options = defaultOptions){
    let styleFiles = WalkSync(options.srcDir)
                    .map(f => path.posix.normalize(path.join(options.srcDir, f)))
    styleFiles = styleFiles.concat(options.files)
    debug(styleFiles);
    for(const style of styleFiles){
        let dest = path.join(options.outDir, style.replace(path.normalize(options.srcDir), ''));
        if(options.files.includes(style)){
            dest = path.join(options.outDir, path.basename(style))
        }
        debug('dest', dest)
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