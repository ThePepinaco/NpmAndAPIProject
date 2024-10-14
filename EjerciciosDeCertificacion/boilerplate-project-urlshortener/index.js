// Carga las variables de entorno desde un archivo .env
require('dotenv').config();

// Importa los módulos necesarios
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns'); // Para resolver nombres de dominio
const fs = require('fs'); // Para manipular el sistema de archivos

const app = express(); // Inicializa la aplicación Express
const port = process.env.PORT || 3000; // Define el puerto a usar

// Middleware para habilitar CORS
app.use(cors());

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Sirve archivos estáticos desde la carpeta 'public'
app.use('/public', express.static(`${process.cwd()}/public`));

// Ruta para la página principal
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html'); // Sirve el archivo index.html
});

// Función para manejar la gestión de datos en un archivo JSON
function dataManagement(action, input) {
  let filePath = './public/data.json'; // Ruta del archivo de datos

  // Crea el archivo si no existe
  if (!fs.existsSync(filePath)) {
    fs.closeSync(fs.openSync(filePath, 'w'));
  }

  let file = fs.readFileSync(filePath); // Lee el archivo

  if (action == 'save data' && input != null) {
    // Guarda los datos en el archivo
    if (file.length == 0) {
      fs.writeFileSync(filePath, JSON.stringify([input], null, 2));
    } else {
      let data = JSON.parse(file.toString());
      let inputExist = data.map(d => d.original_url);
      let check_input = inputExist.includes(input.original_url); // Verifica si la URL ya existe

      if (!check_input) {
        data.push(input); // Agrega la nueva entrada
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Guarda el archivo
      }
    }
  } else if (action == 'load data' && input == null) {
    // Carga los datos del archivo
    if (file.length == 0) return;
    else {
      let dataArray = JSON.parse(file);
      return dataArray; // Retorna los datos leídos
    }
  }
}

// Genera un código corto único
function gen_shorturl() {
  let all_Data = dataManagement('load data');
  let min = 1;
  let max = 1000;

  if (all_Data != undefined && all_Data.length > 0) {
    max = all_Data.length * 1000; // Aumenta el rango basado en la cantidad de datos
  } else {
    max = 1000;
  }

  let short = Math.ceil(Math.random() * (max - min + 1) + min);

  if (all_Data === undefined) {
    return short; // Retorna el código corto si no hay datos
  } else {
    let shortExist = all_Data.map(d => d.short_url);
    let check_short = shortExist.includes(short); // Verifica si el código corto ya existe

    if (check_short) {
      return gen_shorturl(); // Genera uno nuevo si ya existe
    } else {
      return short; // Retorna el nuevo código corto
    }
  }
}

// Ruta para crear una nueva URL acortada
app.post('/api/shorturl', (req, res) => {
  let input = req.body.url; // Obtiene la URL de la solicitud
  let domain = '', param = '', short = 0;

  if (!input) {
    return res.json({ error: 'invalid url' }); // Maneja la URL inválida
  }

  domain = input.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/igm);
  param = domain[0].replace(/^https?:\/\//i, "");

  // Verifica si el dominio es válido
  dns.lookup(param, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' }); // Maneja la URL inválida
    } else {
      short = gen_shorturl(); // Genera un código corto
      let dict = { original_url: input, short_url: short }; // Crea un diccionario con la URL original y corta
      dataManagement("save data", dict); // Guarda los datos
      return res.json(dict); // Retorna el diccionario
    }
  });
});

// Ruta para redirigir a la URL original a partir del código corto
app.get('/api/shorturl/:shorturl', (req, res) => {
  let input = Number(req.params.shorturl);
  let all_Data = dataManagement('load data');
  let shortExist = all_Data.map(d => d.short_url);

  // Verifica si el código corto existe
  if (shortExist.includes(input) && all_Data != undefined) {
    let data_found = all_Data[shortExist.indexOf(input)];
    res.redirect(data_found.original_url); // Redirige a la URL original
  } else {
    res.json({ data: 'No matching data', short: input, existing: shortExist });
  }
});

// Ruta de prueba para comprobar que la API está funcionando
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' }); // Responde con un saludo
});

// Inicializa el servidor en el puerto definido
app.listen(port, function () {
  console.log(`Listening on port ${port}`); // Mensaje en consola al iniciar el servidor
});
