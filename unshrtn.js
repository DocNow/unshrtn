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
    return lookup(short, (error, long) => {
      if (error) {
        console.log(`Error: ${error} - ${short} -> ${long}`);
        try {
          return res.json({
            short,
            long,
            error
          });
        } catch (error1) {
          error = error1;
          return console.log(`unable to send response: ${error}`);
        }
      } else {
        console.log(`${short} -> ${long}`);
        return res.json({
          short,
          long
        });
      }
    });
  } else {
    return res.status(400).json({
      short: null,
      long: null,
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
  return db.get(short, (err, long) => {
    if (!err) {
      return next(null, long);
    } else {
      return unshorten(short, (err, long) => {
        if (!err) {
          db.put(short, long, (e) => {});
          if (err) {
            console.log("unable to write to leveldb:", e);
          }
        }
        return next(err, long);
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
  try {
    let req = request(opts);
    req.on('response', (resp) => {
      let long = resp.request.uri.href;
      if ((resp.statusCode >= 200) && (resp.statusCode < 300)) {
        let content_type = resp.headers['content-type'];
        if (content_type && content_type.match(/text\/x?html/)) {
          let html = [];
          resp.on('data', chunk => html.push(chunk));
          return resp.on('end', () => {
            if (!sent) {
              sent = true;
              html = Buffer.concat(html).toString();
              return next(null, canonical(long, html));
            }
          });
        } else {
          sent = true;
          return next(null, long);
        }
      } else {
        sent = true;
        return next(`HTTP ${resp.statusCode}`, long);
      }
    });
    return req.on('error', (e) => {
      if (!sent) {
        sent = true;
        return next(String(e), short);
      }
    });
  } catch (error) {
    if (!sent) {
      sent = true;
      return next(error, null);
    }
  }
};


var userAgent = (url) => {

  // most of the time we pretend to be a browser but fw.to doesn't give
  // browsers a Location header and instead rely on META refresh and JavaScript
  // to redirect browsers (sigh)

  if (url.match(/https?:\/\/fw\.to/)) {
    return "ushrtn (https://github.com/edsu/unshrtn)";
  } else {
    return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36";
  }
};


var canonical = (url, html) => {
  let dom;
  try {
    dom = new jsdom.JSDOM(html, {url, virtualConsole});
  } catch (e) {
    console.log(`jsdom error ${e}`);
    return url;
  }
  let link = dom.window.document.querySelector('head link[rel=canonical]');
  if (link && link.attributes && link.attributes.href) {
    url = link.attributes.href.value;
  }
  return url;
};


if (require.main === module) {
  app.listen(3000);
}

exports.unshorten = unshorten;
