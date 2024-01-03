require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/phonebook')

app.use(cors())
app.use(express.json())

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.use(express.static('dist'))

const errorHandle = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error : 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      name : error.name,
      error : error.message,
    })
  }

  next(error)
}

app.get('/', (request, response) => {
  response.send('<h1>exercises backend with nodejs and express</h1>')
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(info => {
      const personsLength = info
      const personsLengthText = `<p> Phonebook has info for ${personsLength} people.</p>`
      const time = `<p>${new Date()}</p>`
      response.send(`${personsLengthText} ${time}`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(phonebook => {
    response.json(phonebook)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(foundPerson => {
      if (foundPerson) {
        return response.json(foundPerson)
      } else {
        response.statusCode = 404
        response.statusMessage = 'Not found person identifier'
        response.send('not found the person')
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const name = body.name
  const number = body.number

  if (!name || !number) {
    return response.status(400).json({
      error: '400 Bad Request: name or number are missing',
    })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save()
    .then(returnedPerson => {
      response.json(returnedPerson)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const updatePerson = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(
    request.params.id,
    updatePerson,
    { new : true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(errorHandle)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`)
})

// const randomId = (arr) => {
//   const random = Math.random() * arr.length * 1000;
//   return Math.floor(random);
// };