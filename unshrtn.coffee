level = require 'level'
stream = require 'stream'
express = require 'express'
request = require 'request'

app = express()
app.set 'json spaces', 2
db = level('./unshrtndb')
jar = request.jar()
process.setMaxListeners(10)
userAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36"


app.get "/", (req, res) ->
  short = req.query.url
  if short
    lookup short, (error, long) ->
      if error
        console.log "Error: #{error} - #{short} -> #{long}"
        try
          res.json
            short: short,
            long: long,
            error: error
        catch error
          console.log "unable to send response: #{error}"
      else
        console.log "#{short} -> #{long}"
        res.json
          short: short,
          long: long
  else
    res.status(400).json
      short: null,
      long: null,
      error: "please supply url query parameter"


lookup = (short, next) ->
  if short == null
    next "short url cannot be null", null
    return
  short = String(short)
  db.get short, (err, long) ->
    if not err
      next null, long
    else
      unshorten short, (err, long) ->
        if not err
          db.put short, long, (e) ->
          if err
            console.log "unable to write to leveldb:", e
        next err, long


unshorten = (short, next) ->
  opts =
    url: short
    jar: jar
    timeout: 10000
    headers: {"User-Agent": userAgent}
  sent = false
  try
    req = request opts
    req.on 'response', (resp) ->
      sent = true
      if resp.statusCode >= 200 and resp.statusCode < 300
        next null, resp.request.uri.href
      else
        next "HTTP #{resp.statusCode}", resp.request.uri.href
      resp.on 'data', (chunk) ->
    req.on 'error', (e) ->
      if not sent
        next String(e), null
  catch error
    if not sent
      next error, null


if require.main == module
  app.listen 3000

exports.unshorten = unshorten
