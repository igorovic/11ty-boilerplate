const fs = require('fs-extra');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const cssnano = require('cssnano');
const tailwindcss = require('tailwindcss');

const dev = process.env.NODE_ENV === 'development';

const plugins = [
    tailwindcss('./tailwind.config.js'), 
    !dev ? cssnano({preset: 'default'}) : ()=> {null},
    autoprefixer({env: 'last 6 version'})
]

function postCss(){
    fs.readFile('src/tailwind.css', (err, css) => {
        if(err){
            console.log(err);
        }else{
            postcss(plugins)
                .process(css, { from: 'src/tailwind.css', to: 'public/styles/tailwind.css' })
                .then(result => {
                    fs.outputFile(result.opts.to, result.css, () => true)
                    if ( result.map ) {
                        fs.outputFile(result.opts.to+'.map', result.map, () => true)
                    }
                })
        }
    })
    fs.readFile('src/styles/index.css', (err, css) => {
        if(err){
            console.log(err);
        }else{
            postcss(plugins)
                .process(css, { from: 'src/styles/index.css', to: 'public/styles/index.css' })
                .then(result => {
                    fs.outputFile(result.opts.to, result.css, () => true)
                    if ( result.map ) {
                        fs.outputFile(result.opts.to+'.map', result.map, () => true)
                    }
                })
        }
    })
}

module.exports = postCss;