var jpegtran = require('imagemin-jpegtran');
var mozjpeg = require('imagemin-mozjpeg');
var fs = require('fs');

module.exports = function(grunt) {

	grunt.initConfig({
		less: {
			dev: {
				options: {
					sourceMap: true,
					sourceMapFileInline: true
				},
				files: {
					'runtime/styles/default.css': 'files/styles/default.less',
				}
			},
			dist: {
				options: {
					sourceMap: false
				},
				files: {
					'runtime/styles/default.css': 'files/styles/default.less',
				}
			}
		},
		htmllint: {
			dev: ["out/**/*.html"]
		},
		htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true
			},
			dist: {
				expand: true,
				cwd: 'out/',
				src: ['**/*.html'],
				dest: 'build/'
			}
		},
		cssmin: {   
			options: {
				rebase: false
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'out/',
					src: ['**/*.css'],
					dest: 'build/'
				}]
			}
		},
		imagemin: {
			options: {
				optimizationLevel: 7,
				use: [mozjpeg({quality: 80}), jpegtran({progressive: true})],
			},
			dist: {
				expand: true,
				cwd: 'out/',
				src: ['**/*.{png,jpg,gif}'],
				dest: 'build/',
				filter: function(filepath) {
					var fs = require('fs');
					try {
						var destpath = filepath.replace('out','build');
						fs.statSync(destpath);
					} catch (err) {
						console.log(destpath);
						return true;
					}
					return false;
				}
			}
		},
		uglify: {
			dist: {
				files: [{
					expand: true,
					cwd: 'out/',
					src: '**/*.js',
					dest: 'build/'
				}]
			}
		},
		copy: {
			dev: {
				files: [{
					src: 'runtime/styles/default.css',
					dest: 'out/kuhnidialog.bg/styles/default.css'
				}, {
					src: 'runtime/styles/default.css',
					dest: 'out/kitchensdialog.com/styles/default.css'
				}, {
					src: 'runtime/styles/default.css',
					dest: 'out/kuhnidialog.ru/styles/default.css'
				}, {
					src: 'runtime/styles/default.css',
					dest: 'out/kuechendialog.com/styles/default.css'
				}]
			}
		},
		sync: {
			dist: {
				files: [{
					cwd: 'out/',
					src: ['**/*.xml', '**/*.ico', '**/*.svg', '**/.htaccess', '**/*.ttf', '**/*.woff', '**/*.eot', '**/*.pdf'],
					dest: 'build/'
				}]
			}
		},
		rsync: {
			options: {
				args: ['--chmod a+r'],
				recursive: true
			},
			dist: {
				options: {
					src: 'build/',
					dest: '/var/www/',
					host: 'kuhnidialog@kuhnidialog.bg'
				}
			}
		},
		newer: {
			options: {
				cache: 'runtime'
			}
  		}
	});

	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-rename');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-html');
	grunt.loadNpmTasks('grunt-sync');
	grunt.loadNpmTasks('grunt-rsync');

	grunt.registerTask('compile', ['less:dev', 'copy:dev']);
	grunt.registerTask('build', ['newer:htmlmin:dist', 'newer:cssmin:dist', 'newer:uglify:dist', 'imagemin:dist', 'sync:dist']);
	grunt.registerTask('deploy', ['rsync']);
	grunt.registerTask('default', ['htmllint', 'newer:htmlmin:dist', 'newer:cssmin:dist', 'newer:uglify:dist', 'imagemin:dist', 'sync:dist']);
};