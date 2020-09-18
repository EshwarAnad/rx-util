
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./rx-util.cjs.production.min.js')
} else {
  module.exports = require('./rx-util.cjs.development.js')
}
