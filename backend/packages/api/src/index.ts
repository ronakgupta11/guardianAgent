import { buildServer } from './server';
const server = buildServer();

const port = Number(process.env.PORT || 4000);
server.listen({ port }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});
