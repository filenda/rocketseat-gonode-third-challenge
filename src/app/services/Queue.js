const kue = require('kue')
const Sentry = require('@sentry/node')
const redisConfig = require('../../config/redis')
const jobs = require('../jobs')

const Queue = kue.createQueue({ redis: redisConfig })

/**
 * Tells node to process the queue for all jobs that have the given
 *  key, and then calls the job's 'handle' method
 * */
Queue.process(jobs.PurchaseMail.key, jobs.PurchaseMail.handle)

//  sentry setup for queue errors
Queue.on('error', Sentry.captureException)

module.exports = Queue
