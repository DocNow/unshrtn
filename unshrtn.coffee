level = require 'level'
express = require 'express'
request = require 'request'

app = express()
app.set 'json spaces', 2

db = level('./unshrtndb')

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
        request.get short, (error, r, body) ->
          if error
            callback String(error), null
          else if r.statusCode != 200
            callback "HTTP #{r.statusCode}", null
          else
            long = String(r.request.uri.href)
            db.put short, String(long)
            callback null, long
      catch error
        callback error, null


if require.main == module
  app.listen 3000


exports.unshorten = unshorten
