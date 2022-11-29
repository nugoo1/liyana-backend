const express = require('express')
const Subscription = require('../models/subscription')
const router = new express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const storeItems = require('../data/pricing')

router.get('/subscription', async (req, res) => {
  // Get email from params
  const email = req.query.email
  try {
    const subscription = await Subscription.findOne({
      email
    })
    if (!subscription) {
      return res.status(404).send()
    }
    res.send(subscription)
  } catch (error) {
    res.status(500).send()
  }
})

router.post('/create-checkout-session', async (req, res) => {
  const { itemId, email } = req.body
  const success_url = `${process.env.CLIENT_URL}/app/success?session_id={CHECKOUT_SESSION_ID}`
  const cancel_url = `${process.env.CLIENT_URL}/app/subscribe`

  if (!itemId || !email) {
    return res.status(400).send('Missing required parameters.')
  }

  // Check if user exists in database
  const subscription = await Subscription.findOne({
    email: email
  })

  if (subscription) {
    if (subscription.status === 'active') {
      res.status(409).send('You already have an active subscription!')
      return
    }

    // Existing Customer is Resubscribing
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: storeItems.get(itemId).priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url,
        cancel_url,
        customer: subscription.customerId
        // Pass the ID of the subscription to the success page
        // so that it can be used to retrieve the subscription
        // and display the details to the customer.
      })
      res.send(session)
    } catch (e) {
      res.status(500).send(e)
      console.log(e)
    }
  } else {
    // New Customer
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: storeItems.get(itemId).priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url,
        cancel_url,
        customer_email: email,
        metadata: {
          wordCount: storeItems.get(itemId).wordCount
        }
        // Pass the ID of the subscription to the success page
        // so that it can be used to retrieve the subscription
        // and display the details to the customer.
      })
      res.send(session)
    } catch (e) {
      res.status(500).send(e)
      console.log(e)
    }
  }
})

module.exports = router
