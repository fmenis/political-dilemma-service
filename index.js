import Fastify from 'fastify'
import App from './app.js'

const port = process.env.SERVER_PORT || 3000
const address = process.env.SERVER_ADDRESS || '127.0.0.1'

const fastify = Fastify({
	logger: {
		level: process.env.LOG_LEVEL,
		prettyPrint: process.env.NODE_ENV !== 'production'
	},
});

fastify.register(App)

fastify.listen(port, address, err => {  
  if (err) {
    fastify.log.fatal(err)
    process.exit(1);
  }
  fastify.log.debug(`Server launched in ${process.env.NODE_ENV} mode`)
});