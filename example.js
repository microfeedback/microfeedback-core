const microfeedback = require('.');

/**
 * An example backend that just logs to the console.
 *
 * Input is of the form { name, body } where
 * name is the optional name of the user and
 * body (required) is the content of the feedback.
 * @returns {Promise} The response payload.
 */
const ConsoleBackend = ({input, perspective, akismet}) => {
  const {name, body} = input;
  const response = {name, body};
  if (name) {
    console.log(`Feedback from: ${name}`);
  }
  if (perspective) {
    const {toxicity} = perspective;
    console.log(`Toxicity (from Perspective API): ${toxicity}`);
    response.toxicity = toxicity;
  }
  if (akismet) {
    const {spam} = akismet;
    console.log(`Is spam (from Akismet API): ${spam}`);
    response.spam = spam;
  }
  console.log(body);
  // All backends must return a promise
  // that resolves to the data to respond with
  return Promise.resolve(response);
};

module.exports = microfeedback(ConsoleBackend, {
  name: 'console',
  version: '1.0.0',
});
