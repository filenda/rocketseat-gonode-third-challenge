const server = require('./server')

//  grabs the port from an environment variable (or uses 3000 in case the variable is not defined)
server.listen(process.env.PORT || 3000)
