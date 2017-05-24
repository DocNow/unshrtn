# unshrtn

[![Build Status](https://secure.travis-ci.org/edsu/unshrtn.png)](http://travis-ci.org/edsu/unshrtn)

unshrtn is a [leveldb][1] backed URL unshortening microservice. unshrtn
remembers what it has already looked up so it can save you the trouble of
keeping track of URLs when you are looking up a lot of them in a dataset of
tweets lets say.

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

    docker run -dp 3000:3000 edsu/unshrtn

## License:

* [CC0](LICENSE) public domain dedication


[1]: https://code.google.com/p/leveldb/
[2]: http://nodejs.org
