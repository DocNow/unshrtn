level = require 'level'
rimraf = require 'rimraf'
unshrtn = require './unshrtn'
assert = require('chai').assert

rimraf.sync('testdb')
db = level 'testdb'
u = unshrtn.unshorten

describe 'unshrtn', ->

  it 'unshortens', (done) ->
    u 'http://www.inkdroid.org', (err, long) ->
      assert.equal long, 'http://inkdroid.org/'
      assert.equal err, null
      done()

  it 'handles bad protocol', (done) ->
    u 'foo', (err, long) ->
      assert.equal err, 'Error: Invalid protocol: null'
      done()

  it 'handles 404', (done) ->
    u 'http://example.com/inkdroid', (err, long) ->
      assert.equal err, 'HTTP 404'
      assert.equal long, 'http://example.com/inkdroid'
      done()

  it 'handles connection refused', (done) ->
    u 'http://inkdroid.org:3000/', (err, long) ->
      assert.equal err, 'Error: connect ECONNREFUSED'
      assert.equal long, null
      done()

