const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const App = require('./src/App'); // Import your main React component

const app = express();
const port=process.env.PORT || 3000;

app.get('*', (req, res) => {
  const html = ReactDOMServer.renderToString(<App />); 

  const template = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My SSR App</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/static/js/bundle.js"></script> 
      </body>
    </html>
  `;

  res.send(template);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
