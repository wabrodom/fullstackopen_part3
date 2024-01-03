const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const personName = process.argv[3]
const phoneNumber = process.argv[4]

const url =
  `mongodb+srv://wabrodom:${password}@fullstackopen.b14jatm.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', phonebookSchema)

if (process.argv.length > 4) {
  const person = new Person({
    name: personName,
    number: phoneNumber,
  })

  person.save().then(result => {
    console.log(`added ${personName} number ${phoneNumber} to phonebook`)
    mongoose.connection.close()
  })

} else if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(contact => {
      console.log(`${contact.name} ${contact.number}`)
    })
    mongoose.connection.close()
  })
}

