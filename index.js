require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// In-memory storage
const urls = [];
let nextId = 1;

app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;

  let parsedUrl;

  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const existing = urls.find(
      (entry) => entry.original_url === inputUrl
    );

    if (existing) {
      return res.json(existing);
    }

    const entry = {
      original_url: inputUrl,
      short_url: nextId++
    };

    urls.push(entry);

    res.json(entry);
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const id = Number(req.params.short_url);

  const entry = urls.find(
    (item) => item.short_url === id
  );

  if (!entry) {
    return res.json({
      error: 'No short URL found'
    });
  }

  res.redirect(entry.original_url);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});