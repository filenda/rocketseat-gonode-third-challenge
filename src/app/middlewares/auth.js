const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')
const { promisify } = require('util')

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  //  grabs only the intended part of the header, discarting 'Bearer' word
  const [, token] = authHeader.split(' ')

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret)

    //  this makes every route using this middleware to be able to see
    //  the userId
    req.userId = decoded.id

    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Token Invalid' })
  }
}
