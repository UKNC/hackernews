# hackernews test project for nanit


### Running


First terminal window:

```bash
> cd hackernews
> docker-compose up
```

Second terminal window:

```bash
> cd hackernews
> npm install
> npm test
```
### Test system

Linux Mint 17, docker: Docker version 17.05.0-ce, build 89658be, docker-compose version 1.15.0, build e12f3b9


### API

hackernews exposes the following endpoints:

#### POST /signup
{ username: String, password: String }

Signs up a new user. Authentication used in following requests is HTTP basic auth. ( Should be used with ssh in production )

#### POST /submit 
{ title: String, text: String }

Submits a new post.

#### PUT /edit
{ title: String, text: String, id: existing post id }

Edits an existing post.

#### POST /vote
{ id: existing post id, up: 1 }

Votes up ( up is defined ) or down ( up is undefined ) an existing post.

#### GET /newest?last=lastPostId&n=10

Retrieves ``n`` posts sorted by points and date. ``next`` parameter is used for paging: ``n`` posts are returned with a post following a post with ``lastPostId``.
