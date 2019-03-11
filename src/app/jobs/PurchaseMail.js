const Mail = require('../services/Mail')

class PurchaseMail {
  get key () {
    return 'PurchaseMail'
  }

  async handle (job, done) {
    const { ad, user, content } = job.data

    await Mail.sendMail({
      from: '"Vinicius Filenga" <vinifilenga@hotmail.com>',
      to: ad.author.email,
      subject: `Solicitação de compra: ${ad.title}`,
      html: '<p>essa tempalte asdasdaasd engine é bugada</p>'
      // template: 'purchase',
      // context: { user, content, ad: purchaseAd }
    })

    return done()
  }
}

module.exports = new PurchaseMail()
