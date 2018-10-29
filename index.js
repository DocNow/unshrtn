const fs = require('fs')
const URL = require('url')
const level = require('level')
const stream = require('stream')
const express = require('express')
const winston = require('winston')
const metaweb = require('metaweb')
const program = require('commander')
const readline = require('readline')

const app = express()
app.set('json spaces', 2)

// this is a global variable that is set in openDb
let db = null

process.setMaxListeners(10)

const log = winston.createLogger({
  level: 'error',
  transports: [new winston.transports.Console({
    format: winston.format.simple()
  })]
})

app.get("/", (req, resp) => {
  let short = req.query.url
  let sent = false
  if (short) {
    return lookup(short, (error, result) => {
      if (error) {
        log.error(`Error fetching ${short}: ${error}`)
        try {
          result = {error}
          if (! sent) {
            sent = true
            return resp.json(result)
          }
        } catch (error1) {
          error = error1
          return log.error(`unable to send response: ${error}`)
        }
      } else if (! sent) {
        sent = true
        log.info(`${result.short} -> ${result.long}`)
        return resp.json(result)
      }
    })
  } else if (! sent) {
    sent = true
    return resp.status(400).json({
      error: "please supply url query parameter"
    })
  }
})

const lookup = (url, next) => {
  if (url === null) {
    next("url cannot be null", null)
    return
  }
  const short = String(url)
  return db.get(url, (err, s) => {
    if (!err) {
      return next(null, JSON.parse(s))
    } else {
      metaweb.get(short)
        .then((result) => {
          result.short = url
          result.long = result.url
          delete result.url
          db.put(short, JSON.stringify(result), (e) => {
            if (e) {
              log.error("unable to write to leveldb:", e)
            }
          })
          return next(null, result)
        })
        .catch((err) => {
          log.error("unable to get url: ", url)
          next(err, null)
        })
    }
  })
}


const openDb = path => {
  db = level(path || './unshrtn.db')
}

module.exports = {app, log, lookup, openDb}
