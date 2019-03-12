const Ad = require('../models/Ad')
const Purchase = require('../models/Purchase')
const User = require('../models/User')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')

    //  Eliminate the possibility to purchase an already sold item
    if (purchaseAd.purchasedBy) {
      return res.status(401).json({ error: 'this item is already sold' })
    }

    const user = await User.findById(req.userId)

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    const purchase = await Purchase.create({ ...req.body, author: req.userId })

    return res.json(purchase)
  }

  async accept (req, res) {
    const { purchase } = req.params
    const { ad } = req.body

    const adToBePurchased = await Ad.findById(ad).populate('author')

    //  Check if the purchase-accepting user is the ad author
    if (adToBePurchased.author.id !== req.userId) {
      return res.status(401).json({ error: 'Invalid user' })
    }

    // const adToBePurchased = await Ad.findById(ad)

    // //  Check if the purchase-accepting user is the ad author
    // if (adToBePurchased.author._id.toString() !== req.userId) {
    //   return res.status(401).json({ error: 'Invalid user' })
    // }

    adToBePurchased.purchasedBy = purchase

    const purchasedAd = await Ad.findByIdAndUpdate(ad, adToBePurchased, {
      new: true
    })

    return res.json(purchasedAd)
  }
}

module.exports = new PurchaseController()
