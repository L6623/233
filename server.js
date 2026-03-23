const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy FULL a YouTube-nocookie (todo el dominio)
app.use('/', createProxyMiddleware({
  target: 'https://www.youtube-nocookie.com',
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req) => {
    // Spoof Referer (truco principal para que YouTube no bloquee)
    proxyReq.setHeader('Referer', 'https://www.youtube.com/');
    proxyReq.setHeader('Origin', 'https://www.youtube.com');
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  },
  onProxyRes: (proxyRes) => {
    // Quita TODOS los headers que rompen el embed
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['strict-transport-security'];
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
}));

// Página principal con embed minimizado + búsqueda por ID
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Notas de Clase - Videos</title>
      <link rel="icon" href="https://www.google.com/favicon.ico"/>
      <style>
        body { margin:0; background:#111; color:#eee; font-family:Arial; height:100vh; overflow:hidden; }
        header { background:#202124; padding:10px; text-align:center; }
        h1 { margin:0; font-size:20px; }
        .controls { margin:15px auto; text-align:center; }
        input { padding:10px; width:60%; max-width:400px; border-radius:4px 0 0 4px; }
        button { padding:10px 20px; background:#065fd4; color:white; border:none; border-radius:0 4px 4px 0; cursor:pointer; }
        #playerContainer { height:calc(100vh - 140px); position:relative; transition:all 0.3s; }
        #playerContainer.minimized { height:180px; }
        iframe { width:100%; height:100%; border:none; }
        #minimizeBtn { position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.7); color:white; border:none; padding:8px 12px; border-radius:50%; cursor:pointer; z-index:10; }
      </style>
    </head>
    <body>
      <header><h1>Videos Educativos (Proxy Propio)</h1></header>
      <div class="controls">
        <input type="text" id="videoInput" placeholder="Pega ID o link (ej: dQw4w9WgXcQ)" />
        <button onclick="loadVideo()">Cargar</button>
      </div>
      <div id="playerContainer" class="minimized">
        <button id="minimizeBtn" onclick="toggleMinimize()">⬇️</button>
        <iframe id="ytEmbed" src="about:blank" allowfullscreen allow="autoplay"></iframe>
      </div>
      <script>
        function toggleMinimize() { document.getElementById('playerContainer').classList.toggle('minimized'); }
        function loadVideo() {
          let val = document.getElementById('videoInput').value.trim();
          let id = val;
          if (val.includes('v=')) id = new URLSearchParams(new URL(val).search).get('v');
          if (val.includes('youtu.be/')) id = val.split('youtu.be/')[1];
          document.getElementById('ytEmbed').src = '/' + id + '?autoplay=1&rel=0&modestbranding=1';
          document.getElementById('playerContainer').classList.remove('minimized');
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Proxy YouTube corriendo en ${PORT}`));
