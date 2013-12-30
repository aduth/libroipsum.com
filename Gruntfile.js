module.exports = function(grunt) {

    grunt.initConfig({

        sass: {
            prod: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'css/main.min.css': 'css/sass/main.scss'
                }
            },
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'css/main.css': 'css/sass/main.scss'
                }
            }
        },

        watch: {
            sass: {
                files: 'css/sass/*.scss',
                tasks: ['sass:dev']
            },
            template: {
                files: '**/*.us',
                tasks: ['template:dev']
            }
        },

        template: {
            dev: {
                src: 'index.us',
                dest: 'index.html',
                variables: {
                    dev: true,
                    sources: grunt.file.readJSON('sources.json')
                }
            },
            prod: {
                src: 'index.us',
                dest: 'index.html',
                variables: {
                    dev: false,
                    sources: grunt.file.readJSON('sources.json')
                }
            }
        },

        uglify: {
            prod: {
                files: {
                    'js/app.min.js' : [
                        'js/input-number-polyfill.js',
                        'js/ZeroClipboard.js',
                        'js/LibroIpsum.js',
                        'js/social-likes.js',
                        'js/app.js'
                    ]
                }
            }
        },

        htmlmin: {
            prod: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    collapseBooleanAttributes: true
                },
                files: {
                    'index.html': 'index.html'
                }
            }
        },

        curl: {
            'sources.json': 'http://api.libroipsum.com/sources.json'
        }

    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-templater');
    grunt.loadNpmTasks('grunt-curl');

    grunt.registerTask('default', ['sass:dev', 'template:dev', 'watch']);
    grunt.registerTask('release', ['sass:prod', 'uglify', 'curl', 'template:prod', 'htmlmin']);
    grunt.registerTask('sources', ['curl']);
};
