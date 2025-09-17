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
        // Import HTML templates as strings
        string({ include: ['src/components/**/*.html'] }),

        // Component styles → bundled into JS, injected into shadow DOM
        postcss({
            include: 'src/components/**/*.css',
            inject: false,   // we don’t want auto <style> tags
            extract: false,  // don’t write to disk
            minimize: true,
        }),

        // Global styles → also bundled into JS (not extracted file)
        postcss({
            include: 'src/styles/*.css',
            inject: false,
            extract: 'styles.css', // write to disk for fallback
            minimize: true,
        }),

        html({
            template: 'src/index.html',
            target: 'dist/index.html',
            attrs: ['script:type="module"'],
        }),

        copy({
            targets: [
                { src: 'src/images/**/*', dest: 'dist/images' }
            ]
        }),
    ]
};
