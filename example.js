const wishes = require('./');

/**
 * An example backend that just logs to the console.
 *
 * Input is of the form { name, body } where
 * name is the optional name of the user and
 * body (required) is the content of the feedback.
 */
const ConsoleBackend = ({ name, body }) => {
  if (name) {
    console.log(`Feedback from: ${name}`);
  }
  console.log(body);
  // All backends must return a promise
  // that resolves to the data to respond with
  return Promise.resolve({ name, body });
};

module.exports = wishes(ConsoleBackend, {
  name: 'console',
  version: '1.0.0',
});
