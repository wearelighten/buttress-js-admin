'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const clean = require('gulp-clean');
const bump = require('gulp-bump');

const Paths = {
  SOURCE: 'app/server',
  DEST: 'deploy'
};

const Sources = {
  JS: [`${Paths.SOURCE}/*.js`, `${Paths.SOURCE}/**/*.js`],
  JSON: [`${Paths.SOURCE}/*.json`, `${Paths.SOURCE}/**/*.json`],
  PUG: [`${Paths.SOURCE}/*.pug`, `${Paths.SOURCE}/**/*.pug`]
};

// Scripts
gulp.task('js', function() {
  return gulp.src(Sources.JS, {base: Paths.SOURCE})
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulp.dest(Paths.DEST));
});
gulp.task('scripts', function() {
  return gulp.start('js');
});

// Statics
gulp.task('json', function() {
  return gulp.src(Sources.JSON, {base: Paths.SOURCE})
    .pipe(gulp.dest(Paths.DEST));
});

gulp.task('resources', function() {
  return gulp.start(['json']);
});

// Commands
gulp.task('watch', ['build'], function() {
  // Watch Scripts
  gulp.watch(Sources.JS, ['js']);
  // Watch Resources
  gulp.watch(Sources.JSON, ['resources']);
});

gulp.task('clean', function() {
  return gulp.src([`${Paths.DEST}/*`], {read: false})
    .pipe(clean());
});

gulp.task('build', ['clean'], function() {
  return gulp.start('scripts', 'resources');
});

gulp.task('bump-major', function() {
  return gulp.src(['./package.json', 'app/server/config.json'], {base: './'})
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});
gulp.task('bump-minor', function() {
  return gulp.src(['./package.json', 'app/server/config.json'], {base: './'})
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});
gulp.task('bump-patch', function() {
  return gulp.src(['./package.json', 'app/server/config.json'], {base: './'})
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});
gulp.task('bump-prerelease', function() {
  return gulp.src(['./package.json', 'app/server/config.json'], {base: './'})
    .pipe(bump({type: 'prerelease'}))
    .pipe(gulp.dest('./'));
});
