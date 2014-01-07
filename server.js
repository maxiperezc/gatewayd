var express = require('express')
var requireAll = require('./lib/require-all')

controllers = requireAll({
  dirname: __dirname + '/app/controllers',
  filter: /(.+)\.js(on)?$/
})

var app = express()
app.use(express.static(__dirname + '/public'))

require('./config/initializers/middleware.js').configure(app)
require('./config/routes').configure(app, controllers)

port = process.env.PORT || 4000
app.listen(port)
console.log('Listening on port ', port)

