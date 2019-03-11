const Ad = require('../models/Ad')

class AdController {
  async index (req, res) {
    const filters = {}

    if (req.query.price_min || req.query.price_max) {
      filters.price = {}

      if (req.query.price_min) {
        filters.price.$gte = req.query.price_min //  $gte is mongoose's 'greater than' filter
      }

      if (req.query.price_max) {
        filters.price.$lte = req.query.price_max //  $lte is mongoose's 'lower than' filter
      }
    }

    if (req.query.title) {
      //  Regex behaves similar to c#'s string.contains
      filters.title = new RegExp(req.query.title, 'i') // 'i' makes the query case insensitive
    }

    console.log(filters)

    const ads = await Ad.paginate(filters, {
      page: req.query.page || 1,
      limit: 20,
      populate: ['author'], //  here you can define relationships to include
      sort: '-createdAt'
    })

    return res.json(ads)
  }

  async show (req, res) {
    const ad = await Ad.findById(req.params.id)

    return res.json(ad)
  }

  async store (req, res) {
    //  req.userid comes from the 'auth' middleware
    const ad = await Ad.create({ ...req.body, author: req.userId })

    return res.json(ad)
  }

  async update (req, res) {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, {
      new: true //  this brings back the updated object to the 'ad' const for
      //            it to be returned back to the client
    })

    return res.json(ad)
  }

  async destroy (req, res) {
    await Ad.findByIdAndDelete(req.params.id)

    return res.send()
  }
}

module.exports = new AdController()
