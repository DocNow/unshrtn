let level = require('level');
let rimraf = require('rimraf');
let unshrtn = require('./unshrtn');
let { assert } = require('chai');

rimraf.sync('testdb');
let db = level('testdb');
let u = unshrtn.unshorten;

describe('unshrtn', function() {

  it('unshortens', done =>
    u('https://bitly.com/4kb77v', function(err, result) {
      assert.equal(result.long, 'https://www.youtube.com/watch?v=oHg5SJYRHA0');
      assert.equal(result.status, 200)
      assert.equal(result.content_type, 'text/html; charset=utf-8')
      assert.equal(result.title, "RickRoll'D - YouTube")
      assert.equal(err, null);
      return done();
    })
  );

  it('handles bad protocol', done =>
    u('foo', function(err, result) {
      assert.equal(err, 'Error: Invalid URI "foo"');
      return done();
    })
  );

  it('handles 404', done =>
    u('http://example.com/inkdroid', function(err, result) {
      assert(! err)
      assert.equal(result.long, 'http://example.com/inkdroid');
      assert.equal(result.status, 404)
      return done();
    })
  );

  it('handles redirect to 404', done =>
    u('http://bit.ly/2y1xVk6', function(err, result) {
      assert(! err)
      assert.equal(result.long, 'http://example.com/inkdroid');
      assert.equal(result.status, 404)
      return done()
    })
  );

  it('handles connection refused', done =>
    u('http://inkdroid.org:666/', function(err, result) {
      assert.match(err, /Error: connect ECONNREFUSED/);
      assert.equal(result.long, 'http://inkdroid.org:666/');
      assert.equal(result.status, null)
      return done();
    })
  );

  it('handles t.co', done => 
    u('https://t.co/r2mIeyyY7t', function(err, result) {
      assert.equal(result.long, 'http://www.newshub.co.nz/home/election/2017/08/patrick-gower-bill-english-in-shutdown-mode-over-todd-barclay-texts.html');
      assert.equal(result.status, 200)
      return done();
    })
  );

  it('handles canonical link', done =>
    u('https://www.nytimes.com/2017/05/23/opinion/mitch-landrieu-new-orleans-mayor-speech.html?smprod=nytcore-iphone&smid=nytcore-iphone-share&_r=0', function(err, result) {
      assert.equal(result.canonical, 'https://www.nytimes.com/2017/05/23/opinion/mitch-landrieu-new-orleans-mayor-speech.html');
      assert.equal(result.status, 200)
      return done();
    })
  );

  it('handles network errors', done => 
    u('http://inkdroid.org:2222', function(err, result) {
      assert.match(err, /Error: connect ECONNREFUSED/)
      assert.equal(result.long, 'http://inkdroid.org:2222')
      assert.equal(result.status, null)
      return done();
    })
  );

});
  
