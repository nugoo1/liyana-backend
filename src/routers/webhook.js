const express = require('express')
const router = new express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  'whsec_c696d382e7881353add4a9b019e950bd766cfbc9802b580e6ed8b97b4d7e402c'

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (request, response) => {
    let event = request.body
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers['stripe-signature']
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        )
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message)
        return response.sendStatus(400)
      }
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        // console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)
        // console.log(paymentIntent)
        console.log(event)
        // Then define and call a method to handle the successful payment intent.
        break
      // case 'invoice.payment_succeeded':
      //   const invoice = event.data.object
      //   console.log(`Invoice for ${invoice.amount_due} was successful!`)
      //   console.log(invoice)
      //   break
      case 'checkout.session.completed':
        const session = event.data.object
        console.log(
          `Checkout session for ${session.amount_total} was successful!`
        )
        console.log(session)
        break
      // case 'invoice.payment_succeeded':
      //   const invoice = event.data.object
      //   console.log(`Invoice for ${invoice.amount} was successful!`)
      //   console.log(invoice)
      //   break
      case 'customer.subscription.updated':
        const subscription = event.data.object
        console.log(`Subscription for ${subscription.id} was updated!`)
        console.log(subscription)
        break
      // case 'customer.subscription.deleted':
      //   const deletedSubscription = event.data.object
      //   console.log(`Subscription for ${deletedSubscription.id} was deleted!`)
      //   console.log(deletedSubscription)
      //   break
      // // ... handle other event types
      case 'customer.subscription.created':
        const createdSubscription = event.data.object
        console.log(`Subscription for ${createdSubscription.id} was created!`)
        console.log(createdSubscription)
        break
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`)
    }
    // Return a 200 response to acknowledge receipt of the event
    response.sendStatus(200)
  }
)

// Define a method to handle the successful payment intent.
const handlePaymentIntentSucceeded = paymentIntent => {
  // Get the Customer email from the PaymentIntent
  const email = paymentIntent.receipt_email
  console.log(email)
  console.log(paymentIntent)
}

module.exports = router
