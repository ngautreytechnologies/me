import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import postcss from 'rollup-plugin-postcss';
import html from 'rollup-plugin-generate-html-template';

export default {
    input: 'src/index.js',  // single entry point
    output: {
        file: 'dist/components.bundle.js',
        format: 'iife',
        name: 'ComponentsBundle'
    },
    plugins: [
        resolve(),
        commonjs(),
        string({ include: '**/*.html' }),
        postcss({
            inject: false,
            extract: false,   // CSS can be injected in Shadow DOM
            minimize: true
        }),
        html({
            template: 'src/index.html',
            target: 'dist/index.html',
            attrs: ['script:type="module"']
        })
    ]
};
