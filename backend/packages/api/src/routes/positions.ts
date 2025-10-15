import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    // TODO: get real data from DB / Blockscout
    return { demo: true, positions: [] };
  });
}
