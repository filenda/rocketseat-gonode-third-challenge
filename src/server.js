require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const Youch = require('youch')
const Sentry = require('@sentry/node')
const validate = require('express-validation')
const databaseConfig = require('./config/database')
const sentryConfig = require('./config/sentry')

class App {
  constructor () {
    this.express = express()
    this.isDev = process.env.NODE_ENV !== 'production' // Development, Production, Testing

    //  Make sure to follow the exact calling order bellow
    this.sentry()
    this.database()
    this.middlewares()
    this.routes()
    this.exception()
  }

  sentry () {
    Sentry.init(sentryConfig)
  }

  database () {
    //  connection string expected format:
    //  mongodb://usuario:senha@localhost:27017/databasename
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true, // node-version-specific mongoose instructions
      useNewUrlParser: true // node-version-specific mongoose instructions
    })
  }

  middlewares () {
    // The request handler must be the first middleware on the app
    this.express.use(Sentry.Handlers.requestHandler())

    //  'teaches' express how to interpret json from 'req.body' for eg.
    this.express.use(express.json())
  }

  routes () {
    this.express.use(require('./routes'))
  }

  exception () {
    if (process.env.NODE_ENV === 'production') {
      // The error handler must be before any other error middleware
      this.express.use(Sentry.Handlers.errorHandler())
    }

    this.express.use(async (err, req, res, next) => {
      if (err instanceof validate.ValidationError) {
        return res.status(err.status).json(err)
      }

      if (process.env.NODE_ENV !== 'production') {
        const youch = new Youch(err)

        return res.json(await youch.toJSON())
      }

      return res
        .status(err.status || 500)
        .json({ error: 'Internal Server Error' })
    })
  }
}

//  exports only the object of interest (aka express) of an instance of 'App'
module.exports = new App().express
