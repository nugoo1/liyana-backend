const express = require('express')
const router = new express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Subscription = require('../models/subscription')
const storeItems = require('../data/pricing')

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
    let event = request.body
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (process.env.ENDPOINT_SECRET) {
      // Get the signature sent by Stripe
      const signature = request.headers['stripe-signature']
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          process.env.ENDPOINT_SECRET
        )
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message)
        return response.sendStatus(400)
      }
    }
    const session = event.data.object

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.updated':
        console.log(`Subscription for ${session.id} was updated!`)
        console.log(session)
        // Retrieve the email of the customer
        const customer = await stripe.customers.retrieve(session.customer)
        const product = await stripe.products.retrieve(session.plan.product)

        // See if subscription exists in database
        const subscriptionData = await Subscription.findOne({
          email: customer.email
        })

        if (!subscriptionData) {
          // Brand New Subscription
          const newSub = new Subscription({
            subscriptionId: session.id,
            customerId: session.customer,
            email: customer.email,
            status: session.status,
            start_date: session.start_date,
            cancel_at: session.cancel_at,
            cancel_at_period_end: session.cancel_at_period_end,
            canceled_at: session.canceled_at,
            plan: {
              wordCount: product.metadata['word_count'],
              amount: session.plan.amount_decimal,
              currency: session.plan.currency,
              interval: session.plan.interval,
              product: session.plan.product
            }
          })
          newSub.save()
        } else {
          // Existing Subscription
          subscriptionData.subscriptionId = session.id
          subscriptionData.customerId = session.customer
          subscriptionData.email = customer.email
          subscriptionData.status = session.status
          subscriptionData.start_date = session.start_date
          subscriptionData.cancel_at = session.cancel_at
          subscriptionData.cancel_at_period_end = session.cancel_at_period_end
          subscriptionData.canceled_at = session.canceled_at
          subscriptionData.plan.id = session.plan.id
          ;(subscriptionData.plan.wordCount = product.metadata['word_count']),
            (subscriptionData.plan.amount = session.plan.amount_decimal)
          subscriptionData.plan.currency = session.plan.currency
          subscriptionData.plan.interval = session.plan.interval
          subscriptionData.plan.product = session.plan.product
          subscriptionData.save()
        }
        break

      case 'customer.subscription.deleted':
        console.log(`Subscription for ${session.id} was deleted!`)
        try {
          await Subscription.deleteOne({
            subscriptionId: session.id
          })
        } catch (e) {
          console.log(e)
        }
        break
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`)
    }
    // Return a 200 response to acknowledge receipt of the event
    response.sendStatus(200)
  }
)

module.exports = router
