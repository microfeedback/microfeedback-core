const { send, json, createError } = require('micro');
const microCors = require('micro-cors');
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
    const status = err.statusCode || 500;
    send(res, status, {
      status,
      message: err.message,
    });
  }
};

/**
 * Factory for a micro handler containing the main routing logic.
 *
 * @param Function backend: The backend to use for the service. The backend receives the
 *  parsed input JSON from the client.
 * @param Object attributes: Optional attributes about the backend, e.g. name, version.
 */
module.exports = (backend, attributes) => handleErrors(cors(async (req, res) => {
  if (req.method === 'GET') {
    const response = {
      message: 'Welcome to the wishes API. Send a POST ' +
              'request to this URL to post a new wish.',
      core: {
        version: pkg.version,
      },
    };
    if (attributes) {
      response.backend = attributes;
    }
    send(res, 200, response);
  } else if (req.method === 'POST') {
    const input = await json(req);
    if (!input.body) {
      throw new createError(429, '"body" is required in request payload');
    }
    const result = await backend(input, req, res);
    const responseData = { result };
    if (attributes) {
      responseData.attributes = attributes;
    }
    send(res, 201, responseData);
  } else {
    throw new createError(405, `Method ${req.method} not allowed.`);
  }
}));
