# unshrtn

[![Build Status](https://secure.travis-ci.org/edsu/unshrtn.png)](http://travis-ci.org/edsu/unshrtn)

unshrtn is a [leveldb] backed URL unshortening microservice. unshrtn
remembers what it has already looked up so it can save you the trouble of
keeping track of URLs when you are looking up a lot of them at one time and they
haven't necessarily been de-duplicated. Also, unshrtn will look for 
[canonical links] in HTML responses.

    % curl http://localhost:3000?url=https://bitly.com/4kb77v
    {
      "short": "https://bitly.com/4kb77v",
      "long": "https://www.youtube.com/watch?v=oHg5SJYRHA0"
    }

    % curl http://localhost:3000?url=http://example.com/never-gonna-give-you-up
    {
      "short": "http://example.com/never-gonna-give-you-up",
      "long": null,
      "error": "HTTP 404"
    }

The easiest way to get unshrtn up and running is with Docker. 

    docker run -p 3000:3000 edsu/unshrtn

## License:

* [CC0](LICENSE) public domain dedication


[leveldb]: https://code.google.com/p/leveldb/
[canonical links]: https://en.wikipedia.org/wiki/Canonical_link_element
