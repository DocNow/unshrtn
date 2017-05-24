level = require 'level'
rimraf = require 'rimraf'
unshrtn = require './unshrtn'
assert = require('chai').assert

rimraf.sync('testdb')
db = level 'testdb'
u = unshrtn.unshorten

describe 'unshrtn', ->

  it 'unshortens', (done) ->
    u 'http://inkdroid.org', (err, long) ->
      assert.equal long, 'https://inkdroid.org/'
      assert.equal err, null
      done()

  it 'handles bad protocol', (done) ->
    u 'foo', (err, long) ->
      assert.equal err, 'Error: Invalid URI "foo"'
      done()

  it 'handles 404', (done) ->
    u 'http://example.com/inkdroid', (err, long) ->
      assert.equal err, 'HTTP 404'
      assert.equal long, 'http://example.com/inkdroid'
      done()

  it 'handles connection refused', (done) ->
    u 'http://inkdroid.org:666/', (err, long) ->
      assert.match err, /Error: connect ECONNREFUSED/
      assert.equal long, null
      done()

  it 'handles fw.to', (done) ->
    u 'http://fw.to/ixsPPtP', (err, long) ->
      assert.match long, /www.theglobeandmail.com\/opinion\/fifty-years-in-canada-and-now-i-feel-like-a-second-class-citizen\/article26691065\//
      done()

  it 'handles canonical link', (done) ->
    u 'https://www.nytimes.com/2017/05/23/opinion/mitch-landrieu-new-orleans-mayor-speech.html?smprod=nytcore-iphone&smid=nytcore-iphone-share&_r=0', (err, long) ->
      assert.equal long, 'https://www.nytimes.com/2017/05/23/opinion/mitch-landrieu-new-orleans-mayor-speech.html'
      done()
  
