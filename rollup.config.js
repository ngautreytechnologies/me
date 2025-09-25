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
        resolve({
            browser: true,         // ✅ ensures browser-friendly modules
            preferBuiltins: false, // ✅ avoids Node core over polyfills
        }),
        commonjs(),

        // Import HTML templates as strings
        string({ include: ['src/components/**/*.html'] }),

        // Component-level styles → bundled into JS
        postcss({
            include: 'src/components/**/*.css',
            inject: false,   // don’t auto-inject <style> into <head>
            extract: false,  // don’t write individual files
            minimize: true,
        }),

        // Global styles → extracted as one CSS file
        postcss({
            include: 'src/styles/*.css',
            inject: false,
            extract: 'styles.css',
            minimize: true,
        }),

        html({
            template: 'src/index.html',
            target: 'dist/index.html',
            attrs: ['script:type="module"'],
        }),

        copy({
            targets: [
                { src: 'src/images/**/*', dest: 'dist/images' },
            ],
        }),
    ],
};
