const test = require('ava');
const micro = require('micro');
const listen = require('test-listen');
const rp = require('request-promise');
const pkg = require('./package.json');

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
  const handler = makeService(MockBackend, { name: 'Mock', version: '0.1.0' });
  const service = micro(handler);
  const url = await listen(service);
  return { service, url };
};

test('GET: success', async (t) => {
  const { url } = await maketestService();
  const { body, statusCode } = await request({ uri: url });
  t.is(statusCode, 200);
  t.is(body.core.version, pkg.version);
});

test('GET: returns backend attributes', async (t) => {
  const { url } = await maketestService();
  const { body } = await request({ uri: url });
  t.deepEqual(body.backend, { name: 'Mock', version: '0.1.0' });
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
