# unshrtn

[![Build Status](https://secure.travis-ci.org/edsu/unshrtn.png)](http://travis-ci.org/edsu/unshrtn)

unshrtn is a small [leveldb][1] backed URL unshortening microservice written
for [node][2].  It's a tiny web service you can use from wherever you want, 
which will save you the trouble of going out to the Web to look up the same 
short URL twice. 

    % node unshrtn.js &

    % curl localhost:3000?url=https://bitly.com/4kb77v
    {
      "short": "https://bitly.com/4kb77v",
      "long": "https://www.youtube.com/watch?v=oHg5SJYRHA0"
    }

    % curl localhost:3000?url=http://example.com/never-gonna-give-you-up
    {
      "short": "http://example.com/never-gonna-give-you-up",
      "long": null,
      "error": "HTTP 404"
    }


(twarc)ubuntu@ip-10-39-110-115:~$ python x.py
https://www.youtube.com/watch?v=UMAUgRfzJDU&feature=youtu.be
0:00:00.022468

## License:

* [CC0](LICENSE) public domain dedication


[1]: https://code.google.com/p/leveldb/
[2]: http://nodejs.org


