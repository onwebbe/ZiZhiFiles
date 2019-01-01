const gulp = require('gulp');
const notify = require('gulp-notify');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const Mailer = require('./src/Mailer');
const util = require('gulp-util');
const mailer = new Mailer();

var msgs = '-----------------------------\n';
// const fs = require('fs');
// fs.writeFileSync('./test.json', '');
// process.stdout.write = async function( chunk ) {
//   await fs.appendFile( './test.json', chunk );
// };
function processMocha(path) {
  path = __dirname + '/test/**/*.js';
  gulp
    .src(path)
    .pipe(mocha({
      'reporter': 'xunit',
      'reporter-options': {
        output: 'filename.xml'
      }
    }))
    .on("error", async function(err) {
      var args = Array.prototype.slice.call(arguments);
      // console.log(console.error);
      // await mailer.sendEmail('onwebbe@163.com', 'onwebbe@163.com', 'ZiZhiFiles UT Failed', `<%=error.message %>`);
      notify.onError({
          title: 'Mocha error',
          /*message: '<%=error.message %>'*/
          message: `<%=error.message %>`
      }).apply(this, args);//替换为当前对象
      this.emit();//提交
    });
}
function processJSESlint(path) {
  gulp
    .src(path)
    .pipe(eslint(__dirname + '/.eslintrc'))
    .pipe(eslint.format())
    .pipe(eslint.result(result => {
      // Called for each ESLint result.
      var args = Array.prototype.slice.call(arguments);
      let filePath = result.filePath;
      filePath = filePath.substring(filePath.lastIndexOf("/") + 1);
      msgs = "";
      msgs += `path: ${filePath} : `;
      msgs += `err: ${result.errorCount} : `;
      msgs += `war: ${result.warningCount} : `;
      /*msgs += `msg: ${result.messages.length} : `;*/
      /*notify.onError({
          title: 'esLint error, please check error log',
          message: msgs
      }).apply(this, args);//替换为当前对象*/
    }))
    .pipe(eslint.failAfterError())
    .on("error", function(){
      var args = Array.prototype.slice.call(arguments);
      notify.onError({
          title: 'esLint error',
          /*message: '<%=error.message %>'*/
          message: msgs
      }).apply(this, args);//替换为当前对象
      this.emit();//提交
    });
}
function watchSrc() {
  let watcher = gulp.watch('./src/**/*.js');
  watcher.on('change', function(path, state) {
    console.log('---------------------Start process JSLINT---------------------');
    processJSESlint(path);
    console.log('---------------------End process JSLINT---------------------');
    processMocha(path);
  });
}
function watchTest() {
  let watcher = gulp.watch('./test/**/*.js');
  watcher.on('change', function(path, state) {
    console.log('---------------------Start process JSLINT---------------------');
    processJSESlint(path);
    console.log('---------------------End process JSLINT---------------------');
    processMocha();
  });
}
exports.default = gulp.parallel(watchSrc, watchTest);
