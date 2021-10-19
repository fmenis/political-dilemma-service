
import createRoute from './create.js'
import readRoute from './read.js'

export default async function index(fastify, opts) {
  //TODO capire come dare valori comuni per tutte le rotte
  fastify.register(createRoute, { prefix: '/v1/users'})
  fastify.register(readRoute, { prefix: '/v1/users'})
}