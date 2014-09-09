level = require 'level'
stream = require 'stream'
express = require 'express'
request = require 'request'

# a writer that simply closes the response instead of streaming 
# it all into memory, and possibly causing a memory leak

class EmptyWriter extends stream.Writable
  _write: (b) ->
  _transform: (x) ->
    this.end()

app = express()
app.set 'json spaces', 2
userAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36"

db = level('./unshrtndb')
jar = request.jar()
process.setMaxListeners(10)

# the microservice route

app.get "/", (req, res) ->
  short = req.query.url
  if short
    unshorten short, db, (error, long) ->
      if error
        res.status(500).json
          short: short,
          long: null,
          error: error
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


# unshorten does the work, the callback will be sent an error (hopefully null)
# and the unshortened url (hopefully not null).

unshorten = (short, db, callback) ->
  if short == null
    callback "short url cannot be null", null
    return

  short = String(short)
  db.get short, (err, long) ->
    if not err
      callback null, long
    else
      try
        opts =
          url: short
          jar: jar
          timeout: 10000
          headers: {"User-Agent": userAgent}

        w = new EmptyWriter
        r = request opts
        r.on 'response', (resp) ->
          if resp.statusCode != 200
            callback "HTTP #{resp.statusCode}", null
          else
            long = String(resp.request.uri.href)
            db.put short, String(long)
            callback null, long
        r.pipe(w)

      catch error
        callback error, null


if require.main == module
  app.listen 3000


exports.unshorten = unshorten
