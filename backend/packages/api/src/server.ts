import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from 'fastify-helmet';
import positionsRoutes from './routes/positions';
import simulateRoutes from './routes/simulate';
import executeRoutes from './routes/execute';
import agentRoutes from './routes/agent';

export function buildServer() {
  const server = Fastify({ logger: true });
  server.register(cors, { origin: true });
  server.register(helmet);

  server.register(positionsRoutes, { prefix: '/api/positions' });
  server.register(simulateRoutes, { prefix: '/api/simulate' });
  server.register(executeRoutes, { prefix: '/api/execute' });
  server.register(agentRoutes, { prefix: '/api/agent' });

  return server;
}
