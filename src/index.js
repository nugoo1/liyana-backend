process.env.NODE_ENV = process.env.NODE_ENV || 'development'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.env.development' })
} else if (process.env === 'production') {
  require('dotenv').config({ path: '.env.production' })
}

const express = require('express')
require('./db/mongoose')
const webhookRouter = require('./routers/webhook')
const subscriptionRouter = require('./routers/subscription')

var cors = require('cors')

const app = express()
app.use(cors())

const port = process.env.PORT || 5000

app.use(webhookRouter)
app.use(express.json())
app.use(subscriptionRouter)

app.listen(port, () => {
  console.log(`Server (${process.env.NODE_ENV}) is up on port ` + port)
})
