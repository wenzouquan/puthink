module.exports = function(grunt) {
    // var script = require('grunt-cmd-transport/tasks/lib/script').init(grunt);
    // require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //合并文件
        concat: {
            options: {
                stripBanners: false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            cssConcat: {
                src: ['dist/css/*.css','dist/plug/Swiper-3.3.1/swiper.css'],
                dest: 'dist/css/<%= pkg.name %>-<%= pkg.version %>.css'
            },
            libjsConcat: {
                src: ['src/js/sea.js', 'src/js/zepto.min.js', 'src/js/vue.min.js', 'src/js/vue-router.min.js'],
                dest: 'dist/js/libs.js'
            },

            modulesjsConcat: {
                src: ['dist/modules/**/*.js'],
                dest: 'dist/js/modules-<%= pkg.name %>-<%= pkg.version %>.js',
            },
            templatejsConcat: {
                src: ['dist/template/**/*.js'],
                dest: 'dist/js/template-<%= pkg.name %>-<%= pkg.version %>.js',
            },
            jsConcat:{
                src: ['dist/js/modules-<%= pkg.name %>-<%= pkg.version %>.js','dist/js/template-<%= pkg.name %>-<%= pkg.version %>.js','dist/plug/picLazyLoad.js'],
                dest: 'dist/js/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        //压缩css
        cssmin: {
            options: {
                stripBanners: false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/css/<%= pkg.name %>-<%= pkg.version %>.css',
                dest: 'dist/css/<%= pkg.name %>-<%= pkg.version %>.min.css'
            },
            photo: {
                src:  'src/plug/photo/photo.css',
                dest: 'src/plug/photo/photo.min.css'
            },
        },
        //压缩js
        uglify: {
            options: {
                stripBanners: false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            libjs: {
                src: 'dist/js/libs.js',
                dest: 'dist/js/libs.min.js'
            },
            modulesjs: {
                src: 'dist/modules-<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/modules-<%= pkg.name %>-<%= pkg.version %>.min.js'
            },
            tempplatejs: {
                src: 'dist/js/template-<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/js/template-<%= pkg.name %>-<%= pkg.version %>.min.js'
            },
            appjs: {
                src: 'dist/js/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/js/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
            

        },
        //css检错
        // csslint: {
        //     options: {
        //         csslintrc: '.csslintrc'
        //     },
        //     lax: {
        //         src: ['build/css/*.css']
        //     }
        // },
        //js 检错
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            build: {
                src: ['src/js/modules/**/*.js'],
                //src: ['src/js/plug/**/*.js'],
                // afterconcat: ['dist/js/<%= pkg.name %>-<%= pkg.version %>.min.js']
            }
        },

        // 监听改动
        watch: {
            build: {
                files: ['src/modules/**/*.js', 'src/template/**/*.html', 'src/css/*.css','src/plug/**'],
                tasks: ['lesslint', 'jshint', 'babel', 'less', 'html2js_cmd', 'copy','transport', 'anyreplace', 'concat','cssmin', 'uglify'],
                options: { spawn: false }
            }
        },
        //删除临时文件
        clean: ['tmp/**', 'dist/**'],
        //less 转 
        less: {
            compile: {
                files: {
                    'dist/css/<%= pkg.name %>-<%= pkg.version %>.css': 'src/css/*.css'
                }
            },
            pulg: {
                files: {
                    'plug/photo/photo.css': 'plug/photo/photo.css'
                }
            },
        },
        //压缩优化图片大小
        imagemin: {
            /* 压缩优化图片大小 */
            dist: {
                options: {
                    optimizationLevel: 7,
                    pngquant: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/images/',
                    src: ['**/*.{png,jpg,jpeg,gif}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: 'dist/images/' // 优化后的图片保存位置，默认覆盖
                }]
            }
        },
        
        lesslint: {
            options: {
                csslintrc: '.csslintrc',
                'known-properties': false,
                failOnWarning: false
            },
            src: [
                'src/css/*.css',
            ]
        },
        //html 转 amd 
        html2js_cmd: {
            dist: {
                files: [{
                    cwd: 'src/template/',
                    src: '**/*.html',
                    expand: true,
                    ext: '.js',
                    dest: 'dist/template'
                }]
            }
        },
        //cmd规范文件转换
        transport: {
            target_name: {
                options: {
                    idleading: './dist/modules/',
                    debug: false,
                },
                files: [{
                    cwd: 'dist/modules/',
                    src: '**/*.js',
                    expand: true,
                    dest: 'dist/modules'
                }]
            },
            template: {
                options: {
                    idleading: './dist/template/',
                    debug: false,
                },
                files: [{
                    cwd: 'dist/template',
                    src: '**/*.js',
                    expand: true,
                    dest: 'dist/template'
                }]
            },
            plugJs:{
                options: {
                    idleading: './',
                    debug: false,
                },
                files: [{
                    // cwd: 'build/plug/',
                    // src: '**/*.js',
                    // expand: true,
                    src: 'dist/plug/picLazyLoad.js',
                   // expand: true,
                    dest: 'dist/plug/picLazyLoad.js'
                }]
            }

        },
        //文件内替换
        anyreplace: {
            usemin: {
                options: {
                    timestamp: false,
                    replacements: [{
                        from: /{{__images__}}/ig,
                        to: '/dist/images'
                    }]
                },
                files: [{
                    expand: true,
                    cwd: 'dist/template',
                    src: ['**/*.js'],
                    dest: 'dist/template/'
                }]
            }
        },
        copy: {
                dist: {
                  expand: true,
                  cwd: 'src/plug',
                  src: '**',
                  dest: 'dist/plug',
                }
        },

        babel: {
            options: {
                sourceMap: false,

                presets: ['babel-preset-es2015']
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/modules/',
                    src: ['**/*.js'],
                    dest: 'dist/modules/'
                }]
            }
        }



    });

    // 加载包含 "concat" 合并文件
    grunt.loadNpmTasks('grunt-contrib-concat');

    // 加载包含压缩css
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // 加载包含压缩js
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //检查css 
    //grunt.loadNpmTasks('grunt-contrib-csslint');

    //检查js 
    grunt.loadNpmTasks('grunt-contrib-jshint');

    //监听css js 变化 
    grunt.loadNpmTasks('grunt-contrib-watch');

    //清文件
    grunt.loadNpmTasks('grunt-contrib-clean');

    //less 
    grunt.loadNpmTasks('grunt-contrib-less');

    //less 语法检查
    grunt.loadNpmTasks('grunt-lesslint')
        //文件
        //grunt.loadNpmTasks('grunt-asset-injector');

    //图片压缩
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    //grunt.loadNpmTasks('grunt-html2js');
    //html2amd
    // grunt.loadNpmTasks('grunt-html2amd');
    grunt.loadNpmTasks('grunt-html2js-cmd');
    //cmd
    grunt.loadNpmTasks('grunt-cmd-transport');
    //anyreplace
    grunt.loadNpmTasks('grunt-anyreplace');
    grunt.loadNpmTasks('grunt-babel');
    //grunt.loadNpmTasks('babel-preset-es2015');
    //grunt.loadNpmTasks('grunt-datauri');
    grunt.loadNpmTasks('grunt-contrib-copy');
   // grunt.loadNpmTasks('grunt-css-encode');
    // 默认被执行的任务列表。
    grunt.registerTask('default', ['clean', 'lesslint', 'jshint', 'babel', 'less', 'html2js_cmd','copy', 'transport', 'anyreplace', 'concat', 'cssmin', 'uglify', 'imagemin', 'watch']);
    grunt.registerTask('test', ['transport:plugJs']);
};
