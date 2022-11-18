const express = require('express')
const Subscription = require('../models/subscription')
const router = new express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const storeItems = new Map([
  [
    1,
    {
      priceInCents: 900,
      name: 'Starter',
      interval: 'month',
      intervalCount: 1,
      wordCount: 2000
    }
  ],
  [2, { priceInCents: 2900, name: 'Pro' }]
])

router.get('/subscription', async (req, res) => {
  const subscription = await Subscription.find({})
  res.send(subscription)
})

router.post('/create-checkout-session', async (req, res) => {
  const { itemId, userId, email } = req.body
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: storeItems.get(itemId).name
            },
            unit_amount: storeItems.get(itemId).priceInCents,
            recurring: {
              interval: storeItems.get(itemId).interval,
              interval_count: storeItems.get(itemId).intervalCount
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `http://localhost:8000/app/success?purchase=${itemId}`,
      cancel_url: `http://localhost:8000/app/cancel`,
      customer_email: email,
      client_reference_id: userId
      // Pass the ID of the subscription to the success page
      // so that it can be used to retrieve the subscription
      // and display the details to the customer.
    })
    res.send(session)
  } catch (e) {
    res.status(500).send(e)
    console.log(e)
  }
})

module.exports = router
