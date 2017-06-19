let level = require('level');
let rimraf = require('rimraf');
let unshrtn = require('./unshrtn');
let { assert } = require('chai');

rimraf.sync('testdb');
let db = level('testdb');
let u = unshrtn.unshorten;

describe('unshrtn', function() {

  it('unshortens', done =>
    u('http://inkdroid.org', function(err, long) {
      assert.equal(long, 'https://inkdroid.org/');
      assert.equal(err, null);
      return done();
    })
  );

  it('handles bad protocol', done =>
    u('foo', function(err, long) {
      assert.equal(err, 'Error: Invalid URI "foo"');
      return done();
    })
  );

  it('handles 404', done =>
    u('http://example.com/inkdroid', function(err, long) {
      assert.equal(err, 'HTTP 404');
      assert.equal(long, 'http://example.com/inkdroid');
      return done();
    })
  );

  it('handles connection refused', done =>
    u('http://inkdroid.org:666/', function(err, long) {
      assert.match(err, /Error: connect ECONNREFUSED/);
      assert.equal(long, 'http://inkdroid.org:666/');
      return done();
    })
  );

  it('handles fw.to', done =>
    u('http://fw.to/ixsPPtP', function(err, long) {
      assert.match(long, /www.theglobeandmail.com\/opinion\/fifty-years-in-canada-and-now-i-feel-like-a-second-class-citizen\/article26691065\//);
      return done();
    })
  );

  return it('handles canonical link', done =>
    u('https://www.nytimes.com/2017/05/23/opinion/mitch-landrieu-new-orleans-mayor-speech.html?smprod=nytcore-iphone&smid=nytcore-iphone-share&_r=0', function(err, long) {
      assert.equal(long, 'https://www.nytimes.com/2017/05/23/opinion/mitch-landrieu-new-orleans-mayor-speech.html');
      return done();
    })
  );
});
  
