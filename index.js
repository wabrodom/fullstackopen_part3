require('dotenv').config()
const express = require("express");
const morgan = require('morgan');
const cors = require('cors')
const app = express();
const Person = require('./models/phonebook')

app.use(cors())
app.use(express.json());

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.use(express.static('dist'))

const errorHandle = (error, request, response, next) => {
  console.log(error.message) 

  if (error.name === "CastError") {
    return response.status(400).send({error : 'malformatted id'})
  }
  next(error)
}

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>exercises backend with nodejs and express</h1>");
});

app.get("/info", (request, response) => {
  const personsLength = persons.length;
  const personsLengthText = `<p> Phonebook has info for ${personsLength} people.</p>`;
  const time = `<p>${new Date()}</p>`;
  response.send(`${personsLengthText} ${time}`);
});

app.get("/api/persons", (request, response) => {  
  Person.find({}).then(phonebook => {
    response.json(phonebook)
  })
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    return response.json(person);
  } else {
    response.statusCode = 404;
    response.statusMessage = "Not found person identifier";
    response.send("not found the person");
  }
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
});

const randomId = (arr) => {
  const random = Math.random() * arr.length * 1000;
  return Math.floor(random);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const name = body.name;
  const number = body.number;

  if (!name || !number) {
    return response.status(400).json({
      error: "400 Bad Request: name or number are missing",
    });
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson.save().then(returnedPerson => {
    response.json(returnedPerson)
  })

});

app.use(errorHandle)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`)
});
