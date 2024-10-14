// Carga las variables de entorno desde un archivo .env
require('dotenv').config();

// Inicializa una aplicación Express
let express = require('express');
let app = express();

// Importa y configura body-parser para manejar solicitudes POST con datos en el cuerpo de la solicitud
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * Middleware para registrar en la consola las solicitudes entrantes
 * (método, ruta, y dirección IP) para fines de monitoreo y depuración.
 */
app.use(function(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Sirve archivos estáticos desde la carpeta 'public'
app.use("/public", express.static(__dirname + "/public"));

// Maneja la solicitud GET a la ruta raíz y envía un archivo HTML como respuesta
absolutePath = __dirname + '/views/index.html';
app.get("/", function(req, res) {
  res.sendFile(absolutePath);
});

// Ruta que devuelve un JSON, con opción de transformar el mensaje según una variable de entorno
app.get("/json", (req, res) => {
  let respuesta;
  if (process.env['MESSAGE_STYLE'] === "uppercase") {
    respuesta = "Hello json".toUpperCase();
  } else {
    respuesta = "Hello json";
  }
  res.json({ "message": respuesta });
});

/*
 * Ruta que añade un atributo de tiempo a la solicitud y devuelve el tiempo actual en formato JSON.
 * Usa middleware para modificar la solicitud antes de enviar la respuesta.
 */
app.get("/now", function(req, res, next) {
  req.time = new Date().toString(); // Añade la hora actual a la solicitud
  next();
}, function(req, res) {
  res.json({ time: req.time });
});

// Ruta que devuelve una palabra como parámetro en un JSON
app.get("/:word/echo", function(req, res) {
  const word = req.params.word; // Captura el parámetro de la URL
  res.json({ echo: word });
});

// Ruta que acepta parámetros de consulta (query parameters) para devolver un nombre completo en un JSON
app.get("/name", function(req, res) {
  const firstName = req.query.first; // Captura el parámetro 'first' de la consulta
  const lastName = req.query.last;   // Captura el parámetro 'last' de la consulta
  res.json({ name: `${firstName} ${lastName}` });
});

// Ruta que maneja una solicitud POST para devolver un nombre completo enviado en el cuerpo de la solicitud
app.post("/name", function(req, res) {
  const firstName = req.body.first;
  const lastName = req.body.last;
  res.json({ name: `${firstName} ${lastName}` });
});

// Mensaje de prueba para verificar que el servidor esté funcionando
console.log("Hello World");

// Exporta la aplicación para su uso en otros módulos
module.exports = app;
