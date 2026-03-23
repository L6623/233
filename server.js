const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy todo a YouTube
app.use('/', createProxyMiddleware({
  target: 'https://www.youtube-nocookie.com',
  changeOrigin: true,
  pathRewrite: { '^/embed/': '/embed/' }, // mantiene /embed
  ws: true,
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers['x-frame-options']; // quita bloqueo iframe si existe
    delete proxyRes.headers['content-security-policy']; // ayuda con embeds
  }
}));

// Página principal con iframe apuntando al proxy
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><title>Videos Educativos</title></head>
    <body style="margin:0;background:#000;color:#fff;">
      <h1 style="text-align:center;">YouTube dentro de la página 🔥</h1>
      <p style="text-align:center;">Ejemplo: <a href="/embed/dQw4w9WgXcQ" style="color:#ff0000;">Ver video</a></p>
      <iframe src="/embed/dQw4w9WgXcQ?autoplay=1" width="100%" height="90vh" frameborder="0" allowfullscreen allow="autoplay"></iframe>
    </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Proxy en puerto ${PORT}`));
