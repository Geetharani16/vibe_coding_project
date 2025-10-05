import https from 'https';

const HOST = 'sgkirxqorrongtknnkzt.supabase.co';

console.log(`Testing HTTPS connection to ${HOST}...`);

const options = {
  hostname: HOST,
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('✅ HTTPS connection successful!');
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (error) => {
  console.log('❌ HTTPS connection failed:', error.message);
});

req.on('timeout', () => {
  console.log('❌ HTTPS connection timed out');
  req.destroy();
});

req.setTimeout(10000); // 10 second timeout
req.end();