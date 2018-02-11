# microfeedback-core

[![Build Status](https://travis-ci.org/microfeedback/microfeedback-core.svg?branch=master)](https://travis-ci.org/microfeedback/microfeedback-core)
[![Greenkeeper badge](https://badges.greenkeeper.io/microfeedback/microfeedback-core.svg)](https://greenkeeper.io/)

Core library for building microfeedback backends.

## What is a microfeedback backend?

In short: an easily-deployable HTTP microservice for collecting user feedback about your apps.

## Installation

Requires Node>=8.

```
npm install microfeedback-core --save
```

## Usage

The `microfeedback` function is the only public API. It takes a *backend* function which contains the code to handle user feedback (e.g. post a GitHub issue, send an email) sent from a client.
The second argument, `attributes`, is an `Object` that describes the backend (e.g. `name`, `version`, `description`).

The first argument to the *backend* function
contains the `input` which will contain--at a minimum--an entry named `body` with the feedback content.

If the `PERSPECTIVE_API_KEY` environment variable is set, the first
argument will contain a `perspective` Object with information
returned from the [Perspective API](https://www.perspectiveapi.com/).

If the `AKISMET_API_KEY` environment variable is set, input will be
checked with the Akismet API. If spam is detected, an error response
will be returned. If the `ALLOW_SPAM` environment variable is set, an
error response will not be returned and the first argument to the
backend will contain an `akismet` Object of the form `{spam: Boolean}`.

Perspective and Akismet support can be disabled by setting
`PERSPECTIVE_ENABLED=false` and `AKISMET_ENABLED=false` in the
environment.

The *backend* function also receives the request (`req`) and response (`res`) objects.
See the [node http docs](https://nodejs.org/api/http.html) for more information about these objects.

The `microfeedback` function returns a [micro](https://github.com/zeit/micro) request handler.


```javascript
// index.js
const { createError } = require('micro');
const microfeedback = require('microfeedback');
const sendEmail = require('./email-library');

const EmailBackend = async ({input, perspective}, req, res) => {
  const {name, body} = input;
  const toxicity = perspective ? perspective.toxicity : null;
  const email = process.env.FEEDBACK_EMAIL;  // where to receive feedback
  const subject = '[microfeedback] Feedback posted' + name ? `by ${name}` : '';
  const content = `${name} posted feedback on your app:

${body}

${toxicity ? `Toxicity rating: ${toxicity}` : ''}

Cheers,
The microfeedback Robot`;
  try {
    const result = await sendEmail(email, {subject, content});
    return { status: result.status };
  } catch (err) {
    throw createError(400, 'Could not send email', err);
  }
};

module.exports = microfeedback(EmailBackend, {
  name: 'email',
  version: '1.0.0',
});
```

The service can then be run with the `micro` CLI via `npm start`.

```json
{
  "name": "microfeedback-email",
  "dependencies": {
    "micro": "x.y.z",
    "microfeedback-core": "x.y.z"
  },
  "main": "index.js",
  "scripts": {
    "start": "micro"
  }
}
```

```
npm start
```

## Backends

- [microfeedback-github](https://github.com/microfeedback/microfeedback-github)

## Development

* Fork and clone this repo. `cd` into the project directory.
* `npm install`
* To run tests: `npm test`
* To run the example server with auto-reloading: `npm run dev`

### Debugging in tests with iron-node

Add `debugger` statements, then run the following:

```
npm install -i iron-node
npm run test:debug
```

## License

MIT Licensed.
