export default function(eleventyConfig) {
    // Reload page when changes made to .scss, .css, and .js files
    eleventyConfig.addWatchTarget('./src/scss/');
    eleventyConfig.addWatchTarget('./src/js/');
    eleventyConfig.setServerOptions({
        watch: [
            './dist/css/**/*.css',
        ]
        // module: "@11ty/eleventy-server-browsersync",
        // files: './dist/css/**/*.css',
        // snippetOptions: {
        //     rule: {
        //         match: /<\/body>/i,
        //         fn(snippet, match) {
        //             const { src } = /src='(?<src>[^']+)'/u.exec(snippet).groups;
      
        //             return `<script>${generateScript(src)}</script>${match}`;
        //         },
        //     }
        // },
    });

    eleventyConfig.addPassthroughCopy({ 'src/public': '/assets' });
      
    // function generateScript(src) {
    //     return `
    //     let script = document.createElement('script');
    //     script.setAttribute('async', '');
    //     script.setAttribute('src', '${src}');
    //     document.body.appendChild(script);`;
    // }

    return {
        dir: {
            input: 'src/pages',
            output: 'dist',
            includes: '../partials'
        }
    }
}