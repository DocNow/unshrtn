# unshrtn

*unshrtn* is a [LevelDB] backed URL unshortening microservice written in
[JavaScript] and [Node] for quick, asynchronous processing of requests.
*unshrtn* remembers what it has already looked up so it can save you the trouble
of keeping track of URLs when you are looking up a lot of them at one time and
they haven't necessarily been de-duplicated.

*unshrtn* uses the [metaweb] library to do the lookups, which means that in addition to returning the unshortened URL you will also get some potentially useful metadata if the response happens to be HTML:

```
% curl http://localhost:3000?url=https://bit.ly/348J1DN
{
  "short": "https://bit.ly/348J1DN",
  "long": "https://www.youtube.com/watch?v=oHg5SJYRHA0",
  "canonical": "https://www.youtube.com/watch?v=oHg5SJYRHA0",
  "status": 200,
  "content_type": "text/html; charset=utf-8",
  "title": "RickRoll'D - YouTube",
  "description": "http://www.facebook.com/rickroll548 As long as trolls are still trolling, the Rick will never stop rolling.",
  "image": "https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg",
  "publisher": "YouTube",
  "keywords": ["Cotter548", "Shawn", "Cotter", "lol", "gamefaqs", "CE", "reddit", "rettocs", "no", "brb", "afk", "lawl", "pwnt", "Rickroll", "Rickroll'd", "Rick", "Roll", "Duckroll", "Duck", "rick", "roll", "astley", "..."]
}
```

## Install

Probably the easiest way to get *unshrtn* up and running is with [Docker].

    docker run -p 3000:3000 docnow/unshrtn
    Status: Downloaded newer image for docnow/unshrtn:latest
    info: started http://0.0.0.0:3000

You can also install it with [npm]:

    % npm install -g unshrtn
    % unshrtn
    info: started http://0.0.0.0:3000

## Usage

Once installed you can start up the microservice:

    % unshrtn start

If you'd like more control over how it starts use the *start* subcommand:

    % unshrtn start --host 0.0.0.0 --port 8080 --log /var/log/unshrtn.log

By default *unshrtn* writes its database to *unshrtn.db* in the current working
directory. However you can control this with the *--database* option:

    % unshrt start --database /var/unshrtn/unshrtn.db

You can dump the database as line oriented JSON and load it again if you want to
back it up or move it around:

    % unshrtn dump /path/to/datbase > backup.jsonl
    % cat backup.jsonl | unshrtn load /path/to/another/database

If you just want to look up one URL you can also use *unshrtn* on the command line:

    % unshrtn get https://bitly.com/4kb77v

[LevelDB]: https://code.google.com/p/leveldb/
[JavaScript]: https://en.wikipedia.org/wiki/JavaScript
[Node]: https://nodejs.org
[canonical links]: https://en.wikipedia.org/wiki/Canonical_link_element
[Docker]: https://www.docker.com/
[npm]: https://www.npmjs.com/
[metaweb]: https://github.com/edsu/metaweb
