import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import postcss from 'rollup-plugin-postcss';
import html from 'rollup-plugin-generate-html-template';
import copy from 'rollup-plugin-copy';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/components.bundle.js',
        format: 'iife',
        name: 'ComponentsBundle',
        sourcemap: true,
    },
    plugins: [
        resolve(),
        commonjs(),
        string({ include: '**/*.html' }),
        postcss({
            include: 'src/components/**/*.css',
            inject: false,
            extract: false,
            minimize: true,
        }),
        postcss({
            include: 'src/styles/*.css',
            extract: 'globals.css',
            inject: false,
            minimize: true,
        }),

        // HTML template → copy to dist
        html({
            template: 'src/index.html',
            target: 'dist/index.html',
            attrs: ['script:type="module"'],
        }),

        // Copy images folder to dist
        copy({
            targets: [
                { src: 'src/images/**/*', dest: 'dist/images' }
            ]
        }),
    ]
};
