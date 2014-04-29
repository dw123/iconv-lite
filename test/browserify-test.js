var assert = require('assert'),
    iconv = require('../');

describe("Full Browserify tests", function() {
    it("Smoke test", function(done) {
        var browserify = require('browserify');
        var vm = require('vm');

        var b = browserify();
        b.require(require('path').resolve(__dirname, '../'), {expose: 'iconv-lite'});

        b.bundle(function(err, data) {
            if (err) return done(err);

            var browserContext = {};
            vm.runInNewContext(data, browserContext);
            assert.deepEqual(Object.keys(browserContext), ['require']);

            var browserIconvLite = browserContext.require('iconv-lite');
            assert(browserIconvLite);
            browserIconvLite.browserOnly = true;
            assert(!iconv.browserOnly); // Check that we really have another copy.

            var browserBuffer = browserIconvLite.Buffer;
            assert(browserBuffer);

            // Test internal encodings are present (these are handled by Browserify).
            assert.equal(browserIconvLite.encode('абв', 'utf8').toString('hex'), "d0b0d0b1d0b2");
            assert.equal(browserIconvLite.decode(new browserBuffer("d0b0d0b1d0b2", 'hex'), 'utf8'), 'абв');
            assert.equal(browserIconvLite.encode('abc', 'ucs2').toString('hex'), "610062006300");
            assert.equal(browserIconvLite.decode(new browserBuffer("610062006300", 'hex'), 'ucs2'), 'abc');

            // Test single-byte encodings are present.
            assert.equal(browserIconvLite.encode('абв', 'win1251').toString('hex'), "e0e1e2");
            assert.equal(browserIconvLite.decode(new browserBuffer("e0e1e2", 'hex'), 'win1251'), 'абв');

            // Test double-byte encodings are present.
            assert.equal(browserIconvLite.encode("中国", 'gbk').toString('hex'), "d6d0b9fa");
            assert.equal(browserIconvLite.decode(new browserBuffer("d6d0b9fa", 'hex'), 'gbk'), "中国");

            done();
        });
    });
});


