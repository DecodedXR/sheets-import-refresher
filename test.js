// Self-check for URL cache-busting: node test.js
const vm = require('vm'), fs = require('fs'), assert = require('assert');
const ctx = {}; vm.runInNewContext(fs.readFileSync(__dirname + '/Code.gs', 'utf8'), ctx);
const b = f => ctx.bumpUrl_(f, 123);
assert.equal(b('=IMPORTXML("https://x.com/p", "//h1")'), '=IMPORTXML("https://x.com/p?update=123", "//h1")');
assert.equal(b('=importhtml("https://x.com/p?a=1","table",1)'), '=importhtml("https://x.com/p?a=1&update=123","table",1)');
assert.equal(b('=IMPORTDATA("https://x.com/d.csv?update=99&b=2")'), '=IMPORTDATA("https://x.com/d.csv?update=123&b=2")');
assert.equal(b('=IMPORTXML("https://x.com/p#frag", "//a")'), '=IMPORTXML("https://x.com/p?update=123#frag", "//a")');
assert.equal(b('=IFERROR(IMPORTFEED( "http://x.com/rss" ), "")'), '=IFERROR(IMPORTFEED( "http://x.com/rss?update=123" ), "")');
assert.equal(b('=IMPORTXML(A1, "//h1")'), '');                           // URL in a cell: clear-and-restore instead
assert.equal(b('=IMPORTRANGE("https://docs.google.com/spreadsheets/d/x", "A1:B2")'), '');
assert.equal(b('=SUM(A1:A3)'), '');
// Bumping twice keeps one parameter.
assert.equal(ctx.bumpUrl_(b('=IMPORTXML("https://x.com/p", "//h1")'), 456), '=IMPORTXML("https://x.com/p?update=456", "//h1")');
console.log('ok');
