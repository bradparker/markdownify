(function () {
    'use strict';

    var extensions = [
        '.md',
        '.markdown'
    ];

    var matter = require('gray-matter');
    var through = require('through');
    var marked = require('marked');
    var path = require('path');
    var pygmentize = require('pygmentize-bundled');

    /* Set up syntax highlighting: */
    marked.setOptions({
        highlight: function (code, lang, callback) {
            pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
                callback(err, result.toString());
            });
        },
        gfm: true
    });

    function transform(file) {
        /* Check that we're supposed to modify this extension: */
        if (!fileIsMarkdown(file)) {
            return through();
        }

        var data = '';

        function write(buf) {
            data += buf;
        }

        function end() {
            var result = matter(data)
            marked(result.content, function callback(err, html) {
                if (err) {
                    throw err;
                }
                result.content = html

                this.queue(stringify(result));
                this.queue(null);
            }.bind(this));
        }

        return through(write, end);
    }

    /* From the npm package stringify: */
    function stringify(contents) {
        return 'module.exports = ' + JSON.stringify(contents) + ';';
    }

    function fileIsMarkdown(filename) {
        var ext = path.extname(filename);
        return extensions.indexOf(ext) > -1;
    }

    module.exports = transform;
}());
