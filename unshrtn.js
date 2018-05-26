#!/usr/bin/env node

const fs = require('fs')
const URL = require('url')
const jsdom = require('jsdom')
const level = require('level')
const stream = require('stream')
const express = require('express')
const request = require('request')
const metaweb = require('metaweb')
const winston = require('winston')
const program = require('commander')
const readline = require('readline')

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

const app = express()
app.set('json spaces', 2)

// this is a global variable that is set in openDb
let db = null

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

const dump = (db, path) => {
  let out = path ? fs.createWriteStream(path) : process.stdout
  db.createReadStream()
    .on('data', data => {
      row = [data.key, JSON.parse(data.value)] 
      out.write(JSON.stringify(row) + "\n")
      if (path) {
        console.warn(`dumped ${data.key}`)
      }
    })
}

const load = (db, path) => {
  let input = path ? fs.createReadStream(path) : process.stdin
  var lineReader = readline.createInterface({input: input})
  lineReader.on('line', (line) => {
    row = JSON.parse(line)
    db.put(row[0], JSON.stringify(row[1]))
    console.warn(`loaded ${row[0]}`)
  })
}

const openDb = path => {
  db = level(path || './unshrtndb')
}

if (require.main === module) {

  program
    .version('0.0.7')
    .option('-d, --db <db>', 'leveldb path')
    .command('start', 'start unshrtn')
    .action(cmd => {
      console.log('start ' + cmd.db)
    })
    .parse(process.argv)

  const command = process.argv[2] || 'start'
  const dbPath = process.argv[3] || './unshrtndb' 
  const filePath = process.argv[4]

  openDb(dbPath)

  if (command === 'dump') {
    dump(db, filePath)
  } else if (command === 'load') {
    load(db, filePath)
  } else {
    app.listen(3000)
  }
}

module.exports = {app, openDb}
