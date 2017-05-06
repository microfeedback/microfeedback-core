# micro-wishes

[![Build Status](https://travis-ci.org/wishesjs/micro-wishes.svg?branch=master)](https://travis-ci.org/wishesjs/micro-wishes)

Core library for building Wishes microservices.

## What is a Wishes microservice?

In short: an easily-deployable HTTP microservice for collecting user feedback about your apps.

## Installation

Requires Node>=7.

```
npm install micro-wishes --save
# OR
yarn add micro-wishes
```

## Usage

The `micro-wishes` function is the only public API. It takes a *backend* function which contains the code user feedback (e.g. post a GitHub issue, send an email). The second argument, `attributes`, is an `Object` that describes the backend (e.g. `name`, `version`, `description`).

The *backend* receives the parse client input which will contain--at a minimum--an entry named `body` with the feedback content.

The `micro-wishes` function returns a [micro](https://github.com/zeit/micro) request handler.


```javascript
// index.js
const { createError } = require('micro');
const wishes = require('micro-wishes');
const sendEmail = require('./email-library');

const EmailBackend = async ({ name, body }, req, res) => {
  const email = process.env.FEEDBACK_EMAIL;  // where to receive feedback
  const subject = `[wishes] Feedback from ${name}`;
  const content = `${name} posted feedback on your app:

${body}

Cheers,
The Wishes Robot`;
  try {
    const result = await sendEmail(email, { subject, content });
    return { status: result.status };
  } catch (err) {
    throw new createError(400, 'Could not send email', err);
  }
};

module.exports = wishes(EmailBackend, {
  name: 'email',
  version: '1.0.0',
});
```

The service can then be run with the `micro` CLI via `npm start`.

```json
{
  "name": "micro-wishes-email",
  "dependencies": {
    "micro": "x.y.z",
    "micro-wishes": "x.y.z"
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

- [micro-wishes-github](https://github.com/wishesjs/micro-wishes-github)

## License

MIT Licensed.
