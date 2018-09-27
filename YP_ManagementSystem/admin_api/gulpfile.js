const gulp = require('gulp');
const del = require('del');
//const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const watch = require('gulp-watch');
const babel = require('gulp-babel');
const combiner = require('stream-combiner');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify'); //js压缩
//const minifyCSS = require('gulp-minify-css'); //css压缩
//const gutil = require('gulp-util');
//const dealLess = require('gulp-less');
//const postcss = require('gulp-postcss');
//var autoprefixer = require('autoprefixer');
// var plugins = [
//     autoprefixer({
//         browsers: ['last 10 Chrome versions', 'last 5 Firefox versions', 'Safari >= 6', 'ie > 8']
//     })
// ];
const paths = {
    dest: 'dest',
    babel: ['./**/control/**/*.js', './**/middler/**/*.js', './**/router/**/*.js', './**/app.js', '!./dest/**/*', '!./node_modules/**/*'],
    copy: ['./**/public/**/*', './**/sql/**/*.js', './**/bin/**/*.js', './**/env.js', './**/package.json', './**/processes.json', '!./dest/**/*', '!./node_modules/**/*', '!./**/log/**/*']
};
let timeout = 0;
const restart = function() {
    timeout = setTimeout(function() {
        gulp.stop('babel2');
        gulp.start('babel2');
        console.log('restart');
    }, 5000);
};

gulp.task('clean', function(cb) {
    return del(['./dest/**/*', '!./dest/public/**/*'], cb);
});
gulp.task('babel2', function(cb) {
    const combined = combiner([
        gulp.src(paths.babel),
        watch(paths.babel, vinyl => {

            console.log('编译同步:' + vinyl.path);
            if (!vinyl.stat || !vinyl.stat.nlink) {
                vinyl.base = vinyl.cwd + '/dest';
                console.log('删除:' + vinyl.path);
                del([vinyl.path], cb);
            } else {
                console.log('编译同步:' + vinyl.path);
            }
        }),
        babel({
            "presets": [
                "es2015",
                'es2016',
                'es2017',
                'stage-0'
            ],
            "plugins": [
                [
                    "transform-runtime",
                    //"add-module-exports", "transform-decorators-legacy", "transform-class-properties", 
                    {
                        "helpers": false,
                        "polyfill": false,
                        "regenerator": true,
                        "moduleName": "babel-runtime"
                    }
                ]
            ]
        }), //{   presets: ['es2015', 'stage-0'] },
        rename(function(file) {
            file.basename = file.basename.toLowerCase();
            file.dirname = file.dirname.toLowerCase();
            timeout = 0;
            console.log('timeout clear');
        }),
        gulp.dest(paths.dest),
        notify({
            message: 'KOA 编译成功!'
        })
    ]);

    // any errors in the above streams will get caught
    // by this listener, instead of being thrown:
    combined.on('error', e => {
        gulp.src(paths.babel).pipe(notify({
            message: 'VESH 编译错误:' + e.message
        }));
        restart();
    });
    return combined;
});
gulp.task('copy', function() {
    return gulp.src(paths.copy)
        .pipe(gulp.dest(paths.dest))
});
//gulp.task('default', ['static']);
gulp.task('default', ['babel2', 'copy']);
// setTimeout(function () {
//     gulp.start('babel2');
//     //10s后开始更新替换
// }, 10000);
//todo action ni view moduler check vesh-cli pm2 ngnix cmds