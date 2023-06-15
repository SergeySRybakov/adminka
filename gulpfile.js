const gulp = require("gulp");
const webpack = require("webpack-stream");
const sass = require('gulp-sass')(require('sass'));

const dist = "../../../../Server/OSPanel/domains/localhost/admin";

gulp.task("copy-html", () => {
    return gulp.src("./app/src/index.html")
                .pipe(gulp.dest(dist))
});

gulp.task("build-js", () => {
    return gulp.src("./app/src/main.js")
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: "source-map",
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }],
                                 "@babel/react"]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(gulp.dest(dist));
});

gulp.task("build-scss", () => {
    return gulp.src("./app/sass/style.scss")
                .pipe(sass().on('error', sass.logError))
                .pipe(gulp.dest(dist));
});

gulp.task("copy-api", () => {
    return gulp.src("./app/api/**/*.*")
                .pipe(gulp.dest(dist + "/api"));
});

gulp.task("copy-assets", () => {
    return gulp.src("./app/assets/**/*.*")
                .pipe(gulp.dest(dist + "/assets"));
});

gulp.task("watch", () => {
    gulp.watch("./app/src/index.html", gulp.parallel("copy-html"));
	gulp.watch("./app/src/**/*.*", gulp.parallel("build-js"));
	gulp.watch("./app/sass/**/*.scss", gulp.parallel("build-scss"));
	gulp.watch("./app/api/**/*.*", gulp.parallel("copy-api"));
	gulp.watch("./app/assets/**/*.*", gulp.parallel("copy-assets"));
});

gulp.task("build", gulp.parallel("copy-html", "build-js", "build-scss", "copy-api", "copy-assets"));

gulp.task("default", gulp.parallel("watch", "build"));