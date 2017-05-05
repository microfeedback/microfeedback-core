require('dotenv').config();
const assert = require('assert');
const { send, json, createError } = require('micro');
const microCors = require('micro-cors');
const axios = require('axios');
const pkg = require('./package.json');

const cors = microCors({ allowMethods: ['GET', 'POST', 'OPTIONS'] });

/**
 * Catch errors from the wrapped function.
 * If any errors are caught, a JSON response is generated for that error.
 */
const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (err) {
    if (['production', 'test'].indexOf(process.env.NODE_ENV) === -1 && err.stack) {
      console.error(err.stack);
    }
    send(res, err.statusCode || 500, {
      message: err.message,
    });
  }
};

/* Backends for handling feedback. A backend is a function that
 * takes the input for an issue and returns a Promise (usually
 * an axios response).
 *
 * GitHub is supported out of the box.
 */

const GitHubBackend = ({ name, body }) => {
  const { GH_REPO, GH_TOKEN } = process.env;
  assert(GH_REPO, 'GH_REPO not set');
  assert(GH_TOKEN, 'GH_TOKEN not set');

  const URL = `https://api.github.com/repos/${GH_REPO}/issues`;
  const title = 'TODO';
  const fullBody = `Posted by ${name}: ${body}`;
  return axios({
    method: 'POST',
    url: URL,
    params: {
      access_token: GH_TOKEN,
    },
    data: {
      title,
      body: fullBody,
    },
  });
};

/**
 * Factory for a micro handler containing the main routing logic.
 * Takes a backend as its only input and returns a micro handler.
 */
const makeService = (backend, attributes) => handleErrors(cors(async (req, res) => {
  if (req.method === 'GET') {
    const response = {
      message: 'Welcome to the wishes API. Send a POST ' +
              'request to this URL to post a new issue.',
      core: {
        version: pkg.version,
      },
    };
    if (attributes) {
      response.backend = attributes;
    }
    send(res, 200, response);
  } else if (req.method === 'POST') {
    const { name, body } = await json(req);
    try {
      const { data } = await backend({ name, body });
      send(res, 201, data);
    } catch (err) {
      throw new createError(err.response.status, err.response.data);
    }
  } else {
    throw new createError(405, `Method ${req.method} not allowed.`);
  }
}));

module.exports = makeService(GitHubBackend);
Object.assign(module.exports, { makeService, GitHubBackend });
