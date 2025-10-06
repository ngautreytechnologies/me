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
            browser: true,
            preferBuiltins: false,
        }),
        commonjs(),

        // Import HTML templates as strings, exclude tests
        string({
            include: ['src/components/**/*.html'],
            exclude: ['**/__tests__/**', '**/*.spec.html', '**/*.test.html'],
        }),

        // Component-level styles → bundled into JS, exclude tests
        postcss({
            include: ['src/components/**/*.css'],
            exclude: ['**/__tests__/**', '**/*.spec.css', '**/*.test.css'],
            inject: false,
            extract: false,
            minimize: true,
        }),

        // Global styles → extracted as one CSS file
        postcss({
            include: ['src/assets/styles/*.css'],
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
                { src: 'src/assets/images/**/*', dest: 'dist/images' },
            ],
        }),
    ],
};
