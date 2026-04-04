import App from './app';

const main = () => {
  const server = new App();
  server.start();
};

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

setInterval(() => {
  // console.log('Keep-alive');
}, 1000);

main();
