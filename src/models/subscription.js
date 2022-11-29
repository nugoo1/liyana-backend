const mongoose = require('mongoose')
const validator = require('validator')

const Subscription = mongoose.model('Subscription', {
  subscriptionId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  customerId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate (value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  status: {
    type: String,
    required: true,
    trim: true
  },
  start_date: {
    type: String,
    required: true,
    trim: true
  },
  cancel_at: {
    type: String,
    trim: true
  },
  cancel_at_period_end: {
    type: Boolean,
    trim: true
  },
  canceled_at: {
    type: String,
    trim: true
  },
  plan: {
    id: String,
    wordCount: Number,
    amount: Number,
    currency: String,
    interval: String,
    product: String,
    wordCount: Number
  }
})

module.exports = Subscription
