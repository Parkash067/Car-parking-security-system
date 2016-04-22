var gulp = require('gulp');
var ts = require('gulp-typescript');
var rimraf = require('gulp-rimraf');
var nodemon = require('gulp-nodemon');
var open=require('gulp-open');
var reload=require('gulp-livereload');
var browserSync = require('browser-sync');
//reload({start:true});
 
gulp.task('buildServer',  function () {
  var tsResult = gulp.src('./app.ts')
    .pipe(ts({
        module: 'CommonJS'
      }));
  return tsResult.js.pipe(gulp.dest('./'));
});


gulp.task('nodemon', ['buildServer', 'watch'], function(){
    nodemon({
        script: './app.js',
        text:'./numberPlate.txt'
    }).on('restart', function(){
        console.log('nodemon restarted server.js');
    })
})

/*gulp.task('open', function(){
  var options = {
    uri: 'localhost:3000',
    app: 'chrome'
  };
  gulp.src('./app.js')
  .pipe(open(options));
});*/
gulp.task('start', ['nodemon'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:3000",
        files: ["./*.txt"],
        browser: "google chrome",
        port: 5000,
	});
});

gulp.task('watch', function() {
    //reload.listen();
  gulp.watch(['./app.ts','./numberPlate.txt'], ['buildServer']);
});
gulp.task('default', ['buildServer']);
