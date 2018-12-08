# Breethe Client

**Breethe is a Progressive Web App built by [simplabs](https://simplabs.com).
We build custom web and mobile solutions for our clients to rely on.**

## Improving Understanding of Air Quality Across the World

Breethe allows instant access to up to date air quality data for locations
across the world. Pollution and global warming are getting worse, rather than better, and it affects everyone's daily lives - easily accessible data on how bad things are might help to raise attention and awareness. 🌳💨

The data is retrieved from the [openaq](https://openaq.org) API - be sure to
check that project out!

## The Stack

[![Build Status](https://travis-ci.org/simplabs/breethe-client.svg?branch=master)](https://travis-ci.org/simplabs/breethe-client)

Breethe is built with [Glimmer.js](http://glimmerjs.com), the lightning fast UI
components library backed by [Ember.js](http://emberjs.com)' rendering engine
[Glimmer VM](https://github.com/glimmerjs/glimmer-vm). The data layer is based
on [Orbit.js](http://orbitjs.com) and uses [json:api](http://jsonapi.org) to
communicate with [the server](https://github.com/simplabs/breethe-server).
Styles are compiled with [css-blocks](http://css-blocks.com).

We built Breethe for maximum efficiency and performance. The main JS bundle
weighs in at just over 50KB and we use server-side-prerendering to provide
users with a meaningful response already while they wait for the app to start.
Of course the app is functional offline, using a Service Worker and IndexedDB
via Orbit.js.

**This project is still in a relatively early stage and there are likely still
bugs and there is definitely lots of room for even more improvement.** If you
run into any problems, would like to give feedback or help improve this, please
reach out on github!

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Yarn](https://yarnpkg.com/en/)
* [Ember CLI](https://ember-cli.com/)

## Installation

* `git clone git@github.com:simplabs/breethe-client.git`
* `cd breethe-client`
* `yarn --pure-lockfile`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Tests

* `ember test --server` (unit tests)
* `API_HOST=http://localhost:3001 ember b && yarn test-integration` (integration tests using [puppeteer](https://github.com/GoogleChrome/puppeteer))

## Further Reading / Useful Links

* [glimmerjs](http://github.com/tildeio/glimmer/)
* [ember-cli](https://ember-cli.com/)
* [openaq](https://openaq.org/)

## License

Breethe is developed by &copy; [simplabs GmbH](http://simplabs.com) and
contributors. While we invite everyone to use this for inspiration and
reference, we do not grant a license to reuse or redistribute this in any form.

If you would like to use this for educational or charitable purposes, please
reach out at breethe@simplabs.com
