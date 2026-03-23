const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy principal a YouTube (cambia el target si quieres otro sitio)
app.use('/', createProxyMiddleware({
  target: 'https://www.youtube.com',
  changeOrigin: true,          // Cambia el origin para que YouTube crea que es directo
  pathRewrite: { '^/': '' },   // Quita prefijo si usas /youtube/ (opcional)
  secure: true,
  ws: true,                    // Soporta WebSockets (necesario para algunos features de YT)
  onProxyReq: (proxyReq, req, res) => {
    // Puedes agregar headers custom si quieres stealth
    proxyReq.setHeader('User-Agent', req.headers['user-agent'] || 'Mozilla/5.0');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Quita headers que rompen embeds o iframes
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
  }
}));

// Ruta simple para home (puedes poner un HTML básico o redirigir)
app.get('/home', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>YouTube Proxy - Angel Atlanta</title>
      <style>body { background:#0f0f0f; color:white; font-family:Arial; text-align:center; padding:50px; }</style>
    </head>
    <body>
      <h1>YouTube Proxy 🔥</h1>
      <p>Usa este link para videos: <br>https://tu-dominio.onrender.com/watch?v=VIDEO_ID</p>
      <p>O busca: <a href="/results?search_query=tu busqueda" style="color:#ff0000;">Ir a buscar</a></p>
      <p>Si falla, prueba Koyeb o Fly.io we.</p>
    </body>
    </html>
  `);
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Proxy YouTube corriendo en puerto ${PORT}`);
});
