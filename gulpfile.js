var gulp = require('gulp');
var todo = require('gulp-todo');
var todoSrc = [
    'api/**/*.js',
    'common/**/*.js',
    'controllers/**/*.js',
    'models/**/*.js',
    'test/**/*.js',
    'middlewares/**/*.js',
    'picviews/**/*.html',
    'public/stylesheets/*.css',
    'public/stylesheets/*.less',
    './*.js'
];
// generate a todo.md from your javascript files
gulp.task('todo', function() {
    gulp.src(todoSrc)
        .pipe(todo({
            customTags: ['DONE'],
            absolute: false,
            transformComment: function (file, line, text, kind, ref) {
                if (kind === 'DONE') {
                    text = '~~' +text+ '~~';
                }
                if (ref) {
                    ref = '[@'+ref+'](https://github.com/'+ref+')';
                }
                return ['| ' + file + ' | ' + line + ' | '+ ref + ' ' + text];
            }
        }))
        .pipe(gulp.dest('./'))
        .pipe(todo.reporter('json', {fileName: 'todo.json'}))
        .pipe(gulp.dest('./')); //output todo.json as json
    // -> Will output a TODO.md with your todos
});


// Delete the todo.md file if no todos were found
var gulpIf = require('gulp-if');
var del = require('del');
var vinylPaths = require('vinyl-paths');
gulp.task('todo-delete', function() {
    gulp.src(todoSrc)
        .pipe(todo())
        .pipe(gulpIf(function (file) {
            return file.todos && Boolean(file.todos.length);
        }, gulp.dest('./'), vinylPaths(del)));
});