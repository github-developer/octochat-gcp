const { app } = require('./lib/app');
const handlers = require('./lib/handlers');
const logger = require('./lib/logger');
const { getConfig } = require('./lib/secrets');

// set up handlers for each route
app.get('/', handlers.getRoot);
app.get('/messages/:userId', handlers.getConversation);
app.get('/sent', handlers.getSent);
app.get('/login', handlers.login);
app.get('/logout', handlers.logout);
app.get('/oauth', handlers.completeOauth);
app.get('/health-check', handlers.healthCheck);
app.post('/messages', handlers.validateMessage(), handlers.postMessage);

const PORT = process.env.PORT || 8080;

const startServer = () => {
  app.listen(PORT, () => logger.info(`listening on port ${PORT}`));
};

const main = async () => {
  const config = await getConfig();
  process.env.CLIENT_ID = config.client_id;
  process.env.CLIENT_SECRET = config.client_secret;
  process.env.SESSION_STORE_SECRET = config.session_store_secret;
  process.env.TITLE = 'Octochat';
  startServer();
};

main();
