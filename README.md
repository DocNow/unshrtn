# unshrtn

[![Build Status](https://secure.travis-ci.org/edsu/unshrtn.png)](http://travis-ci.org/edsu/unshrtn)

unshrtn is a small [leveldb][1] backed URL unshortening microservice written
for [node][2].  It's a web service you can use from your programming
language of choice, which will save you the trouble of going out to the Web 
to look up the same short URL twice, which can be handy when you are 
unshortening a lot of URLs.

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
