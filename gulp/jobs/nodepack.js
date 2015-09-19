var gulp = require("gulp");
var gutil = require("gulp-util");
var _ = require("lodash");
var named = require("vinyl-named");
var webpack = require("gulp-webpack");

var conf = _.get(require("./../../gulpconfig.js"), "nodepack", {});

function nodepackJob(src, dest, opts) {
    opts = _.extend(_.extend({
        logTag: gutil.colors.gray("[nodepack]")
    }, conf), opts);

    return function () {
        return gulp.src(src)
            .pipe(named())
            .pipe(webpack(opts, null, function (err, stats) {
                gutil.log(opts.logTag, "\n" + stats.toString({
                    colors: true,
                    hash: false,
                    version: false,
                    timings: false,
                    assets: false,
                    chunks: false,
                    chunkModules: false,
                    modules: true,
                    cached: false,
                    reasons: false,
                    source: true,
                    errorDetails: true,
                    chunkOrigins: true
                }));
            }))
            .pipe(gulp.dest(dest));
    };
};

module.exports = nodepackJob;
