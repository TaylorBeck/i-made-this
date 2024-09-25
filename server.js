const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/capture', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const stylePromises = $('link[rel="stylesheet"]').map(async (i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const cssUrl = new URL(href, url).href;
        const cssContent = await fetch(cssUrl).then(res => res.text());
        return `<style>${cssContent}</style>`;
      }
    }).get();

    const styles = await Promise.all(stylePromises);
    $('head').append(styles);
    $('link[rel="stylesheet"]').remove();

    const imgPromises = $('img').map(async (i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        const imgUrl = new URL(src, url).href;
        const imgBuffer = await fetch(imgUrl).then(res => res.buffer());
        const base64 = imgBuffer.toString('base64');
        const mime = `image/${imgUrl.split('.').pop()}`;
        $(elem).attr('src', `data:${mime};base64,${base64}`);
      }
    }).get();

    await Promise.all(imgPromises);

    res.send($.html());
  } catch (error) {
    console.error('Error capturing page:', error);
    res.status(500).send('Error capturing page');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
