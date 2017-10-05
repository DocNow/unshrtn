let URL = require('url')
let jsdom = require('jsdom');
let level = require('level');
let stream = require('stream');
let express = require('express');
let request = require('request');

let app = express();
app.set('json spaces', 2);
let db = level('./unshrtndb');
let jar = request.jar();
process.setMaxListeners(10);
let virtualConsole = new jsdom.VirtualConsole();

app.get("/", (req, res) => {
  let short = req.query.url;
  if (short) {
    return lookup(short, (error, result) => {
      if (error) {
        console.log(`Error: ${error} - ${result.short} -> ${result.long}`);
        try {
          return res.json({...result, error})
        } catch (error1) {
          error = error1;
          return console.log(`unable to send response: ${error}`);
        }
      } else {
        return res.json(result)
      }
    });
  } else {
    return res.status(400).json({
      error: "please supply url query parameter"
    });
  }
});


var lookup = (short, next) => {
  if (short === null) {
    next("short url cannot be null", null);
    return;
  }
  short = String(short);
  return db.get(short, (err, s) => {
    if (!err) {
      return next(null, JSON.parse(s));
    } else {
      return unshorten(short, (err, result) => {
        if (!err) {
          db.put(short, JSON.stringify(result), (e) => {
            if (e) {
              console.log("unable to write to leveldb:", e);
            }
          })
        }
        return next(err, result);
      });
    }
  });
};


var unshorten = (short, next) => {
  let opts = {
    url: short,
    jar,
    timeout: 10000,
    strictSSL: false,
    headers: {"User-Agent": userAgent(short)}
  };
  let sent = false;
  let result = {
    short: short,
    long: short,
    canonical: null,
    status: null,
    content_type: null,
    title: null
  }
  try {
    let req = request(opts);
    req.on('response', (resp) => {
      result.long = resp.request.uri.href;
      result.status = resp.statusCode
      result.content_type = resp.headers['content-type'];
      if (result.content_type && result.content_type.match(/text\/x?html/)) {
        let html = [];
        resp.on('data', chunk => html.push(chunk));
        return resp.on('end', () => {
          if (!sent) {
            sent = true;
            html = Buffer.concat(html).toString();
            addHtmlMetadata(result, html)
            return next(null, result);
          }
        });
      } else {
        sent = true;
        return next(null, result);
      }
    });
    return req.on('error', (e) => {
      if (!sent) {
        sent = true;
        return next(String(e), result);
      }
    });
  } catch (error) {
    if (!sent) {
      sent = true;
      return next(String(error), result);
    }
  }
};


var userAgent = (url) => {

  // most of the time we pretend to be a browser but some services don't give
  // browsers a Location header and instead rely on META refresh and JavaScript
  // to redirect browsers (sigh) when they are told we are not a browser
  // they give an HTTP redirect, which is nice
  
  if (['t.co', 'fw.to'].indexOf(URL.parse(url).hostname) != -1) {
    return "ushrtn (https://github.com/edsu/unshrtn)";
  } else {
    return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36";
  }
};


var addHtmlMetadata = (result, html) => {
  let dom;
  try {
    dom = new jsdom.JSDOM(html, {url: result.long, virtualConsole});
  } catch (e) {
    console.log(`jsdom error ${e}`);
    return result;
  }

  let link = dom.window.document.querySelector('head link[rel=canonical]');
  if (link && link.attributes && link.attributes.href) {
    result.canonical = link.attributes.href.value;
  }

  let title = dom.window.document.querySelector('head title');
  if (title) {
    result.title = title.text;
  }

  return result;
};


if (require.main === module) {
  app.listen(3000);
}

exports.unshorten = unshorten;
