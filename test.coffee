level = require 'level'
rimraf = require 'rimraf'
unshrtn = require './unshrtn'
assert = require('chai').assert

rimraf.sync('testdb')
db = level 'testdb'
u = unshrtn.unshorten

describe 'unshrtn', ->

  it 'unshortens', (done) ->
    u 'http://www.inkdroid.org', db, (err, long) ->
      assert.equal long, 'http://inkdroid.org/'
      done()

  it 'handles bad protocol', (done) ->
    u 'foo', db, (err, long) ->
      assert.equal err, 'Error: Invalid protocol: null'
      done()

  it 'handles 404', (done) ->
    u 'http://example.com/inkdroid', db, (err, long) ->
      assert.equal err, 'HTTP 404'
      assert.equal long, null
      done()

  it 'handles null', (done) ->
    u null, db, (err, long) ->
      assert.equal err, 'short url cannot be null'
      done()
