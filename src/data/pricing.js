const storeItems = new Map([
  [
    1,
    {
      priceId: process.env.PRICE_ID_1,
      name: 'Starter',
      interval: 'monthly',
      wordCount: 15000
    }
  ],
  [
    2,
    {
      priceId: process.env.PRICE_ID_2,
      name: 'Pro',
      interval: 'monthly',
      wordCount: 50000
    }
  ],
  [
    3,
    {
      priceId: process.env.PRICE_ID_3,
      name: 'Starter',
      interval: 'yearly',
      wordCount: 15000
    }
  ],
  [
    4,
    {
      priceId: process.env.PRICE_ID_4,
      name: 'Pro',
      interval: 'yearly',
      wordCount: 50000
    }
  ]
])

module.exports = storeItems
