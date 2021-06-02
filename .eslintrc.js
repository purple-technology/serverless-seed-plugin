module.exports = {
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	env: {
		es6: true,
		node: true,
		'jest/globals': true
	},
	parserOptions: {
		ecmaVersion: 2018
	},
	plugins: ['jest']
}
