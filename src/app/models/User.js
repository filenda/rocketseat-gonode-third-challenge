const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowerCase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

//  'pre' method allows hooks to happen before specific db actions
// 'save' actions server both creation and update of documents
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  this.password = await bcrypt.hash(this.password, 8)
})

UserSchema.methods = {
  compareHash (password) {
    return bcrypt.compare(password, this.password)
  }
}

//  static methods have no access to 'this' class and its properties
//  they are  statically executed
UserSchema.statics = {
  // ES dismember user to grab 'id' property
  generateToken ({ id }) {
    return jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.ttl // milliseconds
    })
  }
}

//  static method are fired directly from the model, and not from an
//  instance of the class as the default 'methods'

module.exports = mongoose.model('User', UserSchema)
