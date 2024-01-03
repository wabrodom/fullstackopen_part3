const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('start connecting to mongoDB')
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB.')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: [9, 'is shorter than the minimum allowed length (8).'],
    // have length of 8 or more be formed of two parts that are separated by -,
    // the first part has two or three numbers and the second part also consists of numbers
    validate: {
      validator: function(value) {
        if (value.split('-')[0].length < 3) {
          const pattern  =/(^\d{2}-)(\d{6,})$/
          return pattern.test(value)
        } else {
          const pattern  = /^([0-9]{3}-)([0-9]{5,})$/
          return pattern.test(value)
        }
      },
      message : props => `${props.value} is not valid phone number.`
    },
    required: true,
  }
})

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', phonebookSchema)