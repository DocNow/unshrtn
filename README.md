# unshrtn

unshrtn is a small [leveldb][1] backed URL unshortening microservice written
for [node][2]:

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

## License:

* [CC0](LICENSE) public domain dedication


[1]: https://code.google.com/p/leveldb/
[2]: http://nodejs.org


