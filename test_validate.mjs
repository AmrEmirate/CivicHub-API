import('./src/middleware/validate.js').then(() => {
  console.log('OK: validate loaded via ESM');
}).catch(e => {
  console.error('FAIL:', e.message, e.stack);
});
