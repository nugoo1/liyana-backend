const mongoose = require('mongoose')
const validator = require('validator')

const Subscription = mongoose.model('Subscription', {
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
})

module.exports = Subscription
