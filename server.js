const bodyParser = require('body-parser');
const dns = require('dns');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

let shorturl = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});
app.route('/api/shorturl/:short_url?')
  .get(function (req, res) {
    let { short_url } = req.params;
    if (shorturl[short_url] == undefined) {
      res.json({ 'error': 'invalid url' });
    }
    res.redirect(shorturl[short_url]);
  })
  .post(function (req, res, next) {
    let { url } = req.body;
    let data = {
      isValid: false,
      url: url
    };
    if (url.includes('http://') || url.includes('https://')) {
      data.isValid = true;
    }
    req.data = data;
    next();
  }, function (req, res, next) {
    let { isValid, url } = req.data;
    if (isValid) {
      dns.lookup(url, function (err, addr) {
        if (err) req.data.isValid = false;
        next();
      });
    }
    next();
  }, function (req, res) {
    if (!req.data.isValid) {
      res.json({ 'error': 'invalid url' });
    }
    shorturl.push(req.data.url);
    res.json({
      'original_url': req.data.url, 'short_url': shorturl.indexOf(req.data.url)
    });
  });

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
