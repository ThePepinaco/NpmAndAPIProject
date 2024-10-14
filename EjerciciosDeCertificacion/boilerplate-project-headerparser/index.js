// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importación del framework Express para crear el servidor
var express = require('express');
var app = express();

// Middleware para habilitar CORS con la opción de estado 200 para solicitudes preflight
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// Configura la carpeta pública para servir archivos estáticos
app.use(express.static('public'));

// Ruta para la página principal
// Sirve el archivo index.html ubicado en la carpeta 'views'
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Ruta API de prueba: "/api/hello"
// Responde con un mensaje JSON básico
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Ruta API "/api/whoami" para obtener la información del cliente
app.get("/api/whoami", (req, res) => {
  res.json({
    ipaddress: req.ip, // Dirección IP del cliente
    language: req.headers['accept-language'], // Idioma aceptado del cliente
    software: req.headers['user-agent'], // Información del software cliente (navegador, sistema operativo)
  });
});

// Inicializa el servidor en el puerto configurado en las variables de entorno o en el puerto 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
