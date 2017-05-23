module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            my_target: {
                files: {
                    'nklibsjs.min.js':
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
                    'nklibsjs.min.css':
                        [
                            'src/**/*.css'
                        ]
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/base/base.js', 'src/**/*.js'],
                dest: 'nklibsjs.js'
            }
        },
        concat_css: {
            options: {
                // Task-specific options go here. 
            },
            all: {
                src: ['src/**/*.css'],
                dest: 'nklibsjs.css'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-concat');
    
    grunt.registerTask('default', ['uglify', 'cssmin', 'concat_css', 'concat']);

};