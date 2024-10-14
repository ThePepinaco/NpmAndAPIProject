// Importación de módulos:
// - express: Framework para crear el servidor.
// - cors: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
// - dotenv: Permite usar variables de entorno desde un archivo .env.
// - multer: Middleware para manejar la subida de archivos.
var express = require('express');
var cors = require('cors');
require('dotenv').config();

var app = express();

// Configuración de multer para gestionar la carga de archivos, los archivos se almacenarán en la carpeta 'uploads/'.
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

// Se habilitan CORS para permitir solicitudes desde otros orígenes.
// Se sirve el contenido estático desde la carpeta 'public'.
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

// Ruta para la página principal:
// Al acceder a la raíz ('/'), se envía el archivo 'index.html' ubicado en la carpeta 'views'.
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Ruta para la API de análisis de archivos:
// - Recibe un archivo a través de un formulario (usando multer para manejar el archivo).
// - Retorna un objeto JSON con el nombre, tipo MIME y tamaño del archivo cargado.
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  try {
    res.json({
      "name": req.file.originalname,
      "type": req.file.mimetype,
      "size": req.file.size
    });
  } catch (err) {
    // Manejo de errores en caso de que la subida del archivo falle.
    res.send(400);
  }
});

// Configuración del puerto del servidor, ya sea a través de la variable de entorno o el puerto 3000 por defecto.
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});
