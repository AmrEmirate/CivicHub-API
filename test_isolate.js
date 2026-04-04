try {
  require('./dist_test/src/middleware/validate.js');
  console.log('OK: validate loaded');
} catch(e) {
  console.error('=== FULL ERROR ===');
  console.error('Message:', e.message);
  console.error('Stack:', e.stack);
}
process.exit(0);
