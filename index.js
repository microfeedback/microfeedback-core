const {send, json, createError} = require('micro');
const Perspective = require('perspective-api-client');
const microCors = require('micro-cors');
const pkg = require('./package.json');

const cors = microCors({allowMethods: ['GET', 'POST', 'OPTIONS']});

const perspectiveEnabled = Boolean(process.env.PERSPECTIVE_API_KEY && process.env.PERSPECTIVE_ENABLED !== 'false');

/**
 * Catch errors from the wrapped function.
 * If any errors are caught, a JSON response is generated for that error.
 */
const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (err) {
    if (process.env.NODE_ENV === 'dev' && err.stack) {
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
module.exports = (backend, attributes) =>
  handleErrors(
    cors(async (req, res) => {
      if (req.method === 'GET') {
        const response = {
          message:
            'Welcome to the microfeedback API. Send a POST ' +
            'request to send feedback.',
          core: {
            version: pkg.version,
            perspectiveEnabled,
          },
        };
        if (attributes) {
          response.backend = attributes;
        }
        send(res, 200, response);
      } else if (req.method === 'POST') {
        const input = await json(req);
        if (!input.body) {
          throw createError(422, '"body" is required in request payload');
        }
        let perspective = null;
        if (perspectiveEnabled) {
          const perspectiveClient = new Perspective(({apiKey: process.env.PERSPECTIVE_API_KEY}));
          const response = await perspectiveClient.analyze(input.body, {truncate: true});
          const toxicity = response.attributeScores.TOXICITY.summaryScore.value;
          perspective = {toxicity};
        }
        const result = await backend({input, perspective}, req, res);
        const responseData = {result};
        if (attributes) {
          responseData.backend = attributes;
        }
        send(res, 201, responseData);
      } else {
        throw createError(405, `Method ${req.method} not allowed.`);
      }
    })
  );
