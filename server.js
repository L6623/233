const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy para YouTube embeds (nocookie para mejor bypass y privacidad)
app.use('/embed', createProxyMiddleware({
  target: 'https://www.youtube-nocookie.com',
  changeOrigin: true,
  pathRewrite: { '^/embed': '/embed' },
  ws: true, // si necesitas live o algo
  onProxyRes: (proxyRes) => {
    // Quita headers que podrían romper el iframe
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    proxyRes.headers['access-control-allow-origin'] = '*'; // ayuda en algunos casos
  }
}));

// Página principal con el embed integrado (servida directamente)
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
        body { margin:0; background:#111; color:#eee; font-family:Arial,sans-serif; height:100vh; overflow:hidden; }
        header { background:#202124; padding:10px; text-align:center; border-bottom:2px solid #065fd4; }
        h1 { margin:0; font-size:20px; }
        .controls { margin:15px auto; text-align:center; }
        input { padding:10px; width:60%; max-width:400px; font-size:16px; border:none; border-radius:4px 0 0 4px; outline:none; }
        button { padding:10px 20px; background:#065fd4; color:white; border:none; border-radius:0 4px 4px 0; cursor:pointer; font-weight:bold; }
        button:hover { background:#054aa3; }
        #playerContainer { height:calc(100vh - 140px); position:relative; transition:all 0.3s ease; }
        #playerContainer.minimized { height:180px; }
        iframe { width:100%; height:100%; border:none; }
        #minimizeBtn { position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.7); color:white; border:none; padding:8px 12px; border-radius:50%; cursor:pointer; z-index:10; font-size:18px; }
        #minimizeBtn:hover { background:rgba(255,255,255,0.3); }
        #info { text-align:center; font-size:13px; color:#888; margin:10px; }
      </style>
    </head>
    <body>
      <header><h1>Videos Educativos</h1></header>

      <div class="controls">
        <input type="text" id="videoInput" placeholder="Pega ID o link completo (ej: dQw4w9WgXcQ)" />
        <button onclick="loadVideo()">Cargar</button>
      </div>

      <div id="playerContainer" class="minimized">
        <button id="minimizeBtn" onclick="toggleMinimize()">⬇️</button>
        <iframe id="ytEmbed" src="about:blank" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
      </div>

      <div id="info">
        Todo queda aquí mismo (sin salir a YouTube). Minimiza con el botón. Pega ID o link — ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ
      </div>

      <script>
        const container = document.getElementById('playerContainer');
        const iframe = document.getElementById('ytEmbed');
        const input = document.getElementById('videoInput');

        function toggleMinimize() {
          container.classList.toggle('minimized');
        }

        function loadVideo() {
          let inputVal = input.value.trim();
          if (!inputVal) return alert('Pega un ID o link we!');

          // Extrae ID si es link completo
          let videoId = inputVal;
          if (inputVal.includes('v=')) {
            const urlParams = new URLSearchParams(new URL(inputVal).search);
            videoId = urlParams.get('v');
          } else if (inputVal.includes('youtu.be/')) {
            videoId = inputVal.split('youtu.be/')[1].split('?')[0];
          }

          if (!videoId) return alert('No se detectó ID válido');

          // Carga desde el proxy /embed
          iframe.src = '/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1';

          // Expande al cargar
          container.classList.remove('minimized');
        }

        // Enter para buscar
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') loadVideo();
        });

        // Opcional: video default minimizado
        // input.value = 'dQw4w9WgXcQ'; loadVideo();
      </script>
    </body>
    </html>
  `);
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en puerto ${PORT}`);
});
