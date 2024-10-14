// Importa el framework Express para crear el servidor
var express = require('express');
var app = express();

// Middleware para habilitar CORS con la opción de estado 200 para solicitudes preflight
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// Configura la carpeta pública para servir archivos estáticos
app.use(express.static('public'));

// Ruta para la página principal
// Sirve el archivo index.html ubicado en la carpeta 'views'
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Ruta API de prueba: "/api/hello"
// Responde con un mensaje JSON básico
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Ruta API principal "/api"
// Devuelve la fecha y hora actual en formato Unix y UTC
app.get("/api", (req, res) => {
  const now = new Date();
  res.json({ unix: now.getTime(), utc: now.toUTCString() });
});

// Ruta API para manejar fechas específicas "/api/:date"
// Acepta una fecha en formato Unix o una cadena de fecha legible
app.get("/api/:date", (req, res) => {
  const paramsDate = req.params.date; // Captura el parámetro de fecha de la URL
  const invalidDate = "Invalid Date"; // Mensaje de error para fechas inválidas

  // Determina si el parámetro es un timestamp (número) o una fecha legible
  const date = parseInt(paramsDate) < 10000
      ? new Date(paramsDate) // Fecha legible
      : new Date(parseInt(paramsDate)); // Timestamp

  // Comprueba si la fecha es inválida
  date.toString() === invalidDate
      ? res.json({ error: invalidDate }) // Devuelve error si la fecha es inválida
      : res.json({ unix: date.valueOf(), utc: date.toUTCString() }); // Devuelve la fecha en Unix y UTC
});

// Inicializa el servidor en el puerto configurado en las variables de entorno o en el puerto 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
