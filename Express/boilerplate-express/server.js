// Configuración de los módulos necesarios y la aplicación Express
const bGround = require('fcc-express-bground');
const myApp = require('./myApp');
const express = require('express');
const app = express();

/*
 * Si no se deshabilita explícitamente, este middleware maneja CORS (Cross-Origin Resource Sharing),
 * permitiendo solicitudes solo desde ciertos orígenes definidos. 
 * Se controla el acceso desde los dominios permitidos para mejorar la seguridad.
 */
if (!process.env.DISABLE_XORIGIN) {
  app.use((req, res, next) => {
    const allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    const origin = req.headers.origin || '*';
    if (!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

// Configura el puerto en el que la aplicación escucha, utilizando una variable de entorno o el puerto 3000
const port = process.env.PORT || 3000;

// Inicia la aplicación y escucha en el puerto definido
bGround.setupBackgroundApp(app, myApp, __dirname).listen(port, () => {
  bGround.log(`Node is listening on port ${port}...`);
});
