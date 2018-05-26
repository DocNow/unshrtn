const rimraf = require('rimraf')
const request = require('supertest')

const { equal } = require('assert')
const { app, openDb } = require('./unshrtn')

describe('app', function() {

  this.timeout(10000)

  beforeEach(function(done) {
    rimraf('./testdb', done)
  })

  it('ushortens', function(done) {
    openDb('./testdb')
    request(app)
      .get('/?url=https://bitly.com/4kb77v')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        equal(res.body.short, 'https://bitly.com/4kb77v')
        equal(res.body.long, 'https://www.youtube.com/watch?v=oHg5SJYRHA0')
        equal(res.body.title, "RickRoll'D - YouTube")
        done()
      });
  })

})


