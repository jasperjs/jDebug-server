/*
 * jasper-application
 * https://github.com/jasperjs/jasper-application
 *
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-typescript');

    grunt.initConfig({
        typescript: {
            options: {
                module: 'commonjs', //or commonjs
                target: 'es5', //or es3
                sourceMap: false,
                declaration: false,
                references: [
                    'typed/**/*.d.ts'
                ],
                generateTsConfig: true
            },
            base: {
                src: ['*.ts', 'lib/**/*.ts']
            }
        }
    });

    /**
     * Task builds jasper-application
     */
    grunt.registerTask('default', ['typescript']);


};