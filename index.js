'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./install-custom-font.cjs.production.js')
} else {
  module.exports = require('./install-custom-font.cjs.development.js')
}
