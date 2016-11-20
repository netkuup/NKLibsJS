module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            my_target: {
                files: {
                    'nklibsjss.min.js':
                        [
                            'src/base/base.js',
                            'src/**/*.js'
                        ]
                }
            }
        },
        cssmin: {
            my_target: {
                files: {
                    'nklibsjss.min.css':
                        [
                            'src/**/*.css'
                        ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');


    grunt.registerTask('default', ['uglify', 'cssmin']);

};