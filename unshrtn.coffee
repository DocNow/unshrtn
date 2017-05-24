jsdom = require 'jsdom'
level = require 'level'
stream = require 'stream'
express = require 'express'
request = require 'request'

app = express()
app.set 'json spaces', 2
db = level('./unshrtndb')
jar = request.jar()
process.setMaxListeners(10)
virtualConsole = new jsdom.VirtualConsole()

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
    headers: {"User-Agent": userAgent short}
  sent = false
  try
    req = request opts
    req.on 'response', (resp) ->
      long = resp.request.uri.href
      if resp.statusCode >= 200 and resp.statusCode < 300
        content_type = resp.headers['content-type']
        if content_type and content_type.match(/text\/x?html/)
          html = []
          resp.on 'data', (chunk) ->
            html.push chunk
          resp.on 'end', ->
            if sent
              return
            sent = true
            html = Buffer.concat(html).toString()
            next null, canonical(long, html)
        else
          sent = true
          next null, long
      else
        next "HTTP #{resp.statusCode}", long
    req.on 'error', (e) ->
      if not sent
        next String(e), null
  catch error
    if not sent
      next error, null


userAgent = (url) ->

  # most of the time we pretend to be a browser but fw.to doesn't give
  # browsers a Location header and instead rely on META refresh and JavaScript
  # to redirect browsers (sigh)

  if url.match(/https?:\/\/fw\.to/)
    return "ushrtn (https://github.com/edsu/unshrtn)"
  else
    return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36"


canonical = (url, html) ->
  dom = new jsdom.JSDOM(html, url: url, virtualConsole: virtualConsole)
  link = dom.window.document.querySelector('head link[rel=canonical]')
  if link and link.attributes and link.attributes.href
    url = link.attributes.href.value
  return url


if require.main == module
  app.listen 3000

exports.unshorten = unshorten
