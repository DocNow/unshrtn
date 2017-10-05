# unshrtn

[![Build Status](https://secure.travis-ci.org/edsu/unshrtn.png)](http://travis-ci.org/edsu/unshrtn)

unshrtn is a [LevelDB] backed URL unshortening microservice written in
[JavaScript] and [Node] for quick, asynchronous processing of requests. unshrtn
remembers what it has already looked up so it can save you the trouble of
keeping track of URLs when you are looking up a lot of them at one time and they
haven't necessarily been de-duplicated.

In addition to returning the unshortened URL unshrtn will also return 
metadata for the page including:

* final HTTP status code
* final HTTP content type
* a canonical link for HTML responses
* a title for HTML responses

		% curl http://localhost:3000?url=https://bitly.com/4kb77v
		{
			"short": "https://bitly.com/4kb77v",
			"long": "https://www.youtube.com/watch?v=oHg5SJYRHA0",
			"canonical": "https://www.youtube.com/watch?v=oHg5SJYRHA0",
			"status": 200,
			"content_type": "text/html; charset=utf-8",
			"title": "RickRoll'D - YouTube"
		}

The easiest way to get unshrtn up and running is with [Docker]. 

    docker run -p 3000:3000 edsu/unshrtn

You can also install it with [npm]:

    npm install -g unshrtn

[LevelDB]: https://code.google.com/p/leveldb/
[JavaScript]: https://en.wikipedia.org/wiki/JavaScript
[Node]: https://nodejs.org
[canonical links]: https://en.wikipedia.org/wiki/Canonical_link_element
[Docker]: https://www.docker.com/
[npm]: https://www.npmjs.com/
