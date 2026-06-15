const express = require('express');
const fs      = require('fs');
const path    = require('path');
const cors    = require('cors');

const app  = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'chat-logs.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // sirve index.html, panel.html, catalogo.html

// ── Inicializar archivo JSON si no existe ──
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify({ sesiones: [] }, null, 2));
  console.log('📁 Archivo chat-logs.json creado');
}

// ── Guardar mensaje del chatbot ──
app.post('/api/chat-log', (req, res) => {
  const { sesionId, tipo, mensaje, respuesta } = req.body;

  if (!mensaje) return res.status(400).json({ error: 'Mensaje vacío' });

  const data = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));

  // Buscar sesión existente o crear nueva
  let sesion = data.sesiones.find(s => s.sesionId === sesionId);
  if (!sesion) {
    sesion = {
      sesionId,
      fecha: new Date().toLocaleDateString('es-BO'),
      inicio: new Date().toLocaleTimeString('es-BO'),
      mensajes: []
    };
    data.sesiones.push(sesion);
  }

  // Agregar el mensaje
  sesion.mensajes.push({
    hora:      new Date().toLocaleTimeString('es-BO'),
    tipo,           // "usuario" o "bot"
    mensaje,
    respuesta: respuesta || null
  });

  fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));

  console.log(`💬 LOG guardado → [${tipo}] "${mensaje}"`);
  res.json({ ok: true });
});

// ── Ver todos los logs ──
app.get('/api/chat-log', (req, res) => {
  const data = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  res.json(data);
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   TiticacaTrout · Servidor activo    ║');
  console.log(`  ║   http://localhost:${PORT}               ║`);
  console.log('  ║   Logs → chat-logs.json              ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
