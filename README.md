DustHQ
=======================

Built with:
  * Node, express, mongo
  * Mapbox
  * Socket.io

## Development

This project depends on yarn, mongodb and nodejs 8 to be installed in the system. One you installed those, simply `cd` into this project and run:

```bash
$ cp .env.example .env
$ // Before continuing replace the environment variables in .env with your keys
$ yarn
$ yarn dev
$ // Now you can open your browser and go to http://localhost:3000
```

Some of the frontend pages need some javascript to be built as well. In order to do so:

```bash
$ yarn bundle
```

## Production

Make sure all the .env keys are set in your server and simply run `yarn start` to kick off the server. This project was developed with heroku in mind, so you might have to adapt your build process a bit if you're gonna use something else like digitalocean or whatever.

In order to push your changes to heroku, upload all this stuff into a github repo and connect it using the heroku UI. After that you can just deploy manually from their dashboard or use a githook to automatically deploy to prod when you deploy master to github.