require('dotenv').config()
let express = require('express');
let app = express();


let bodyParser = require('body-parser');

// Montar middleware para analizar datos URL-encoded
app.use(bodyParser.urlencoded({ extended: false }));


app.use(function(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();  // Continuar con la siguiente función en la pila
});

app.use("/public", express.static(__dirname + "/public"))
absolutePath = __dirname + '/views/index.html'
/*app.get(
    "/", 
    function(req, res) {
    res.sendFile(absolutePath);
  })*/
  app.get("/json",(req,res) => {
    let respuesta;
     if(process.env['MESSAGE_STYLE'] === "uppercase"){
      respuesta = "Hello json".toUpperCase();
     }else{
       respuesta = "Hello json";
     }
     res.json({"message": respuesta});
   });

   app.get("/now", function(req, res, next) {
    // Añadir la hora actual al objeto de solicitud (req)
    req.time = new Date().toString();
    next();  // Continuar al siguiente manejador
  }, function(req, res) {
    // Responder con el objeto JSON que contiene la hora
    res.json({ time: req.time });
  });
  
  app.get("/:word/echo", function(req, res) {
    const word = req.params.word;  // Obtener el parámetro de la URL
    res.json({ echo: word });      // Responder con un objeto JSON
  });

  app.get("/name", function(req, res) {
    const firstName = req.query.first;
    const lastName = req.query.last;
    
    // Responder con un JSON que combine los nombres
    res.json({ name: `${firstName} ${lastName}` });
  });
  
  app.post("/name", function(req, res) {
    // Extraer los parámetros first y last del cuerpo de la solicitud
    const firstName = req.body.first;
    const lastName = req.body.last;
    
    // Responder con un JSON combinando el nombre y el apellido
    res.json({ name: `${firstName} ${lastName}` });
  });
console.log("Hello World");


































 module.exports = app;
