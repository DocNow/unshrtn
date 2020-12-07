const rimraf = require('rimraf')
const request = require('supertest')

const { strictEqual } = require('assert')
const { app, openDb } = require('./index')

describe('app', function() {

  this.timeout(10000)

  beforeEach(function(done) {
    rimraf('./testdb', done)
  })

  it('ushortens', function(done) {
    openDb('./testdb')
    request(app)
      .get('/?url=https://bit.ly/348J1DN')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        strictEqual(res.body.short, 'https://bit.ly/348J1DN')
        strictEqual(res.body.long, 'https://www.youtube.com/watch?v=oHg5SJYRHA0')
        strictEqual(res.body.title, "RickRoll'D")
        done()
      });
  })

})


