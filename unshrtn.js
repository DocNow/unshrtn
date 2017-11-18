#!/usr/bin/env node

let URL = require('url')
let jsdom = require('jsdom')
let level = require('level')
let stream = require('stream')
let express = require('express')
let request = require('request')
let metaweb = require('metaweb')
let winston = require('winston')

const logger = new winston.Logger()
const env = process.env.NODE_ENV

if (env === 'development') {
    logger.add(winston.transports.Console, {level: 'debug'})
} else if (env === 'test') {
    const logFile = path.join(__dirname, '..', '..', 'test.log')
    logger.add(winston.transports.File, {filename: logFile})
} else if (env === 'production') {
    const logFile = path.join(__dirname, '..', '..', 'app.log')
    logger.add(winston.transports.File, {filename: logFile})
}

let app = express()
app.set('json spaces', 2)

let db = level('./unshrtndb')

process.setMaxListeners(10)

app.get("/", (req, resp) => {
  let short = req.query.url
  let sent = false
  if (short) {
    return lookup(short, (error, result) => {
      if (error) {
        logger.error(`Error fetching ${short}: ${error}`)
        try {
          result = {error}
          if (! sent) {
            sent = true
            return resp.json(result)
          }
        } catch (error1) {
          error = error1
          return logger.error(`unable to send response: ${error}`)
        }
      } else if (! sent) {
        sent = true
        logger.info(`${result.short} -> ${result.long}`)
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

var lookup = (url, next) => {
  if (url === null) {
    next("url cannot be null", null)
    return
  }
  short = String(url)
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
              logger.error("unable to write to leveldb:", e)
            }
          })
          return next(null, result)
        })
        .catch((err) => {
          logger.error("unable to get url: ", url)
          next(err, null)
        })
    }
  })
}

if (require.main === module) {
  app.listen(3000)
}

exports.app = app 
