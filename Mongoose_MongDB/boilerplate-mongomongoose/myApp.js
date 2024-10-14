// Importa Mongoose para la conexión y manejo de la base de datos MongoDB
const mongoose = require('mongoose');
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

// Establece la conexión con la base de datos utilizando la URI de MongoDB desde las variables de entorno
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define un esquema para almacenar información de personas en la base de datos
const Schema = mongoose.Schema;
const personSchema = new Schema({
  name: { type: String, required: true },  // Nombre es un campo requerido
  age: Number,  // Edad es un número
  favoriteFoods: [String],  // Lista de comidas favoritas
});

// Crea un modelo basado en el esquema de la persona
const Person = mongoose.model('Person', personSchema);

// Función para crear y guardar un nuevo documento de persona en la base de datos
const createAndSavePerson = (done) => {
  const person = new Person({
    name: 'Brian',
    age: 26,
    favoriteFoods: ['Rice', 'Beans', 'Oat'],
  });
  
  person.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

// Lista de varias personas para insertar en la base de datos
const arrayOfPeople = [
  { name: 'Adam', age: 24, favoriteFoods: ['indomie noodle'] },
  { name: 'Sola', age: 36, favoriteFoods: ['roasted yam'] },
  { name: 'Colins', age: 48, favoriteFoods: ['Red wine'] },
];

// Función para insertar varias personas en la base de datos
const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (err, people) => {
    if (err) return console.log(err);
    done(null, people);
  });
};

// Busca personas por nombre
const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, (err, personFound) => {
    if (err) return console.log(err);
    done(null, personFound);
  });
};

// Busca una persona que tenga un alimento específico en su lista de comidas favoritas
const findOneByFood = (food, done) => {
  Person.findOne({ favoriteFoods: food }, (err, singleFood) => {
    if (err) return console.log(err);
    done(null, singleFood);
  });
};

// Busca una persona por su ID en la base de datos
const findPersonById = (personId, done) => {
  Person.findById(personId, (err, data) => {
    if (err) return console.log(err);
    done(null, data);
  });
};

// Encuentra una persona por su ID, añade una comida a su lista de comidas favoritas y guarda el documento actualizado
const findEditThenSave = (personId, done) => {
  const foodToAdd = 'hamburger';
  Person.findById(personId, (err, person) => {
    if (err) return console.log(err);
    person.favoriteFoods.push(foodToAdd);

    person.save((err, updatedPerson) => {
      if (err) return console.log(err);
      done(null, updatedPerson);
    });
  });
};

// Encuentra una persona por nombre y actualiza su edad
const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate(
    { name: personName },
    { age: ageToSet },
    { new: true },
    (err, updatedDoc) => {
      if (err) return console.log(err);
      done(null, updatedDoc);
    }
  );
};

// Elimina una persona de la base de datos por su ID
const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, (err, data) => {
    if (err) return console.log(err);
    done(null, data);
  });
};

// Elimina todas las personas con un nombre específico de la base de datos
const removeManyPeople = (done) => {
  const nameToRemove = 'Mary';

  Person.remove({ name: nameToRemove }, (err, dataToremove) => {
    if (err) return console.log(err);
    done(null, dataToremove);
  });
};

// Encuentra personas que tienen un alimento en su lista de favoritos, ordena los resultados, y limita el número de resultados
const queryChain = (done) => {
  const foodToSearch = 'burrito';

  Person.find({ favoriteFoods: foodToSearch })
    .sort('name') // Ordena por nombre
    .limit(2) // Limita a 2 resultados
    .select(['name', 'favouriteFoods']) // Selecciona solo los campos de nombre y comidas favoritas
    .exec((err, data) => {
      if (err) return console.log(err);
      done(err, data);
    });
};

// Exporta los modelos y funciones para uso externo
exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
