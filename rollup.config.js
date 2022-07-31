import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: ['js/index.js'],
	output: {
		file: 'public/index.js',
		format: 'iife',
		sourcemap: true
	},
	plugins: [
		nodeResolve(),
		commonjs({
            namedExports: {
                'node_modules/bootstrap/dist/js/bootstrap.min.js' : ['bootstrap']
            }
		}),
		// minify
		terser({
			ecma: 2020,
			module: true,
			warnings: true
		})
	]
};