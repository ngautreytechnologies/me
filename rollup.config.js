import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import postcss from 'rollup-plugin-postcss';
import html from 'rollup-plugin-generate-html-template';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/components.bundle.js',
        format: 'iife',
        name: 'ComponentsBundle'
    },
    plugins: [
        resolve(),
        commonjs(),
        string({ include: '**/*.html' }),
        // 🔹 Component styles (inline into JS → Shadow DOM or JS imports)
        postcss({
            include: 'src/components/**/*.css',
            inject: false,   // don’t put in <head>
            extract: false,  // don’t create extra CSS files
            minimize: true
        }),
        // 🔹 Global styles (extract to standalone file)
        postcss({
            include: 'src/styles/*.css',
            extract: 'globals.css',
            minimize: true,
        }),
        html({
            template: 'src/index.html',
            target: 'dist/index.html',
            attrs: ['script:type="module"']
        })
    ]
};
