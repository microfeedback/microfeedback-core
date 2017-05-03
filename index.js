require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const { GH_REPO, GH_TOKEN } = process.env;

const URL = `https://api.github.com/repos/${GH_REPO}/issues`;

app.post('/feedback', (req, res) => {
  const title = 'TEST';
  const body = 'Just a test';
  axios({
    method: 'POST',
    url: URL,
    params: {
      access_token: GH_TOKEN,
    },
    data: {
      title,
      body,
    },
  }).then((response) => {
    res.json({ repo: GH_REPO, response, title, body });
  }).catch((err) => {
    res.json({ error: err.data });
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);  // eslint-disable-line
});
