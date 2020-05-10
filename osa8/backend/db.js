const mongoose = require('mongoose')
const Author = mongoose.model('Author', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  born: {
    type: Number,
  },
}))
const Book = mongoose.model('Book', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: [
    { type: String }
  ]
}))

const User = mongoose.model('User', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true
  },
}))


module.exports = {
  Book,
  Author,
  User
}