DustHQ
=======================

Built with:
  * Node, express, mongo
  * Mapbox
  * Socket.io

## Development

This project depends on yarn, mongodb and nodejs 8 to be installed in the system. Simply `cd` into the cloned project and run:

```bash
$ cp .env.example .env
$ // Before continuing replace the environment variables in .env with your keys
$ yarn
$ yarn dev
```

Some of the frontend pages need to be build as well for certain pages. In order to do so:

```bash
$ yarn bundle
```

## Production

Make sure all the .env keys are set in your server and simply run `yarn start` to kick off the server. This project was developed with heroku in mind, so you might have to adapt your build process a bit if you're gonna use something else like digitalocean or whatever.
