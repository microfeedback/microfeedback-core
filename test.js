const test = require('ava');
const micro = require('micro');
const listen = require('test-listen');
const rp = require('request-promise');

const { makeService } = require('./');


/* Mocked GitHub strategy */
const MockBackend = ({ name, body }) => Promise.resolve({ data: { name, body } });

/**
 * Thin wrapper around request-promise
 * that always resolves to a full response
 * object rather than just the response body
 * and automatically parses JSON respones.
 */
const request = (options) => {
  const defaults = {
    resolveWithFullResponse: true,
    json: true,
  };
  const opts = Object.assign({}, defaults, options);
  return rp(opts);
};

/**
 * Make a mocked service.
 */
const maketestService = async () => {
  const handler = makeService(MockBackend);
  const service = micro(handler);
  const url = await listen(service);
  return { service, url };
};

test('GET: success', async (t) => {
  const { url } = await maketestService();
  const response = await request({ uri: url });
  t.is(response.statusCode, 200);
});


test('POST: success', async (t) => {
  const { url } = await maketestService();
  const body = { name: 'steve', body: 'wat' };
  const response = await request({ uri: url, method: 'POST', body });
  t.is(response.statusCode, 201);
});

test.todo('POST: no issue body given');

test('PUT not supported', async (t) => {
  const { url } = await maketestService();
  const body = { name: 'steve', body: 'wat' };
  const response = await request({ uri: url, method: 'PUT', body, simple: false });
  t.is(response.statusCode, 405);
});
