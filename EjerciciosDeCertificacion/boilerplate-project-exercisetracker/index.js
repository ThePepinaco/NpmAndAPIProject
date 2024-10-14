// Se requieren los módulos necesarios para la aplicación:
// express: Framework para crear el servidor.
// cors: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
// body-parser: Middleware para analizar el cuerpo de las solicitudes HTTP.
// uuid: Para generar identificadores únicos.
// express-validator: Para validar las solicitudes entrantes.
// fs: Para la gestión de archivos (lectura y escritura en un archivo JSON).

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
require('dotenv').config();

// Configuración de middlewares:
// Se configura bodyParser para procesar datos en formato URL y JSON.
// Se habilita CORS para permitir solicitudes desde otros orígenes.
// Se sirve contenido estático desde la carpeta 'public'.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Ruta raíz que envía un archivo HTML como respuesta.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Función para gestionar el almacenamiento y recuperación de datos:
// Dependiendo de la acción ('save data' o 'load data'), guarda o carga los datos en un archivo JSON.
// Se asegura de que el archivo exista antes de intentar leer o escribir en él.
// Guarda nuevos registros o actualiza los existentes (según el ID).
function dataManagement(action, input) {
  let filePath = './public/data.json';
  if (!fs.existsSync(filePath)) {
    fs.closeSync(fs.openSync(filePath, 'w'));
  }

  let file = fs.readFileSync(filePath);
  if (action == 'save data' && input != null) {
    if (file.length == 0) {
      return fs.writeFileSync(filePath, JSON.stringify([input], null, 2));
    } else if (file.length > 0) {
      let allData = JSON.parse(file.toString());
      let id_Exist = allData.map(d => d._id);
      let check_id = id_Exist.includes(input._id);

      if (!check_id) {
        allData.push(input);
        return fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
      } else {
        let user_index = id_Exist.indexOf(input._id);
        allData.splice(user_index, 1, input);
        return fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
      }
    }
  } else if (action == 'load data' && input == null) {
    if (file.length == 0) {
      return;
    } else {
      return JSON.parse(file);
    }
  }
}

// Genera un ID único para el nuevo usuario utilizando 'uuid'.
// Verifica que el ID y el nombre de usuario no existan en los datos antes de asignar uno nuevo.
function gen_id(username) {
  let allData = dataManagement('load data');
  let id = uuid.v4().replace(/-/g, '').slice(0, 24);
  if (allData === undefined) {
    return id;
  } else {
    let id_Exist = allData.map(d => d._id);
    let name_Exist = allData.map(d => d.username);
    if (!id_Exist.includes(id) && !name_Exist.includes(username)) {
      return id;
    }
  }
}

// Filtra el registro de ejercicios de un usuario según los parámetros 'from', 'to', y 'limit'.
function user_log(found_user, from, to, limit) {
  let log_format = found_user.log.map(l => ({
    description: l.description,
    duration: parseInt(l.duration),
    date: l.date,
  }));

  let log_date = [];
  if (!from && !to) {
    log_date = log_format;
  } else if (from) {
    log_date = log_format.filter(d => Date.parse(d.date) > Date.parse(from));
  } else if (to) {
    log_date = log_format.filter(d => Date.parse(d.date) < Date.parse(to));
  }

  let log_fin = limit ? log_date.slice(0, limit) : log_date;

  return {
    _id: found_user._id,
    username: found_user.username,
    count: found_user.count,
    log: log_fin,
  };
}

// Rutas para la gestión de usuarios y ejercicios:

// Ruta POST para crear un nuevo usuario. Valida que el campo 'username' no esté vacío.
app.post(
  '/api/users',
  [check('username', 'username: Path `username` is required').isLength({ min: 1 })],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
    }
    let username = req.body.username;
    let id = gen_id(username);
    if (!id) {
      return res.json({ action: 'input failed, Username already Exist' });
    } else {
      let user = { username: username, _id: id, count: 0, log: [] };
      dataManagement('save data', user);
      return res.json({ username: username, _id: id });
    }
  }
);

// Ruta GET para listar todos los usuarios.
app.get('/api/users', (req, res) => {
  let allData = dataManagement('load data');
  if (!allData) {
    return res.json({ data: 'no data' });
  }
  let data = allData.map(d => ({ username: d.username, _id: d._id }));
  return res.json(data);
});

// Ruta POST para agregar un ejercicio a un usuario existente por ID.
// Valida que 'description' y 'duration' sean correctos y guarda el ejercicio en el registro del usuario.
app.post(
  '/api/users/:_id/exercises',
  [
    check('description', 'desc: Path `description` is required').isLength({ min: 1 }),
    check('duration', 'duration: Path `duration` is required with valid number').matches(/^[0-9]+$/),
  ],
  (req, res) => {
    let id = req.params._id;
    let { description, duration, date } = req.body;

    let allData = dataManagement('load data');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
    }
    if (!allData) {
      return res.json({ data: 'no data' });
    }

    let found_user = allData.find(d => d._id === id);
    if (!found_user) {
      return res.json({ user_id: 'Invalid user id' });
    }

    date = isNaN(Date.parse(date)) ? new Date().toDateString() : new Date(date).toDateString();

    found_user.log.push({ description, duration, date });
    found_user.count += 1;

    dataManagement('save data', found_user);
    return res.json({
      _id: found_user._id,
      username: found_user.username,
      date: date,
      duration: parseInt(duration),
      description: description,
    });
  }
);

// Ruta GET para obtener el historial de ejercicios de un usuario, con la opción de filtrar por fecha o límite.
app.get('/api/users/:_id/logs', (req, res) => {
  let allData = dataManagement('load data');
  if (!allData) {
    return res.json({ data: 'no data' });
  }

  let found_user = allData.find(d => d._id === req.params._id);
  if (!found_user) {
    return res.json({ user_id: 'Invalid user id' });
  }

  let { from, to, limit } = req.query;
  let user_data = user_log(found_user, from, to, limit);
  return res.json(user_data);
});

// Servidor escucha en el puerto definido o en el puerto 3000.
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
