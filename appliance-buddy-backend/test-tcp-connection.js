import net from 'net';
import dotenv from 'dotenv';

dotenv.config();

const HOST = 'sgkirxqorrongtknnkzt.supabase.co';
const PORT = 5432;

console.log(`Testing TCP connection to ${HOST}:${PORT}...`);

const socket = net.createConnection(PORT, HOST);

socket.setTimeout(10000); // 10 second timeout

socket.on('connect', () => {
  console.log('✅ TCP connection successful!');
  socket.destroy();
  process.exit(0);
});

socket.on('timeout', () => {
  console.log('❌ TCP connection timed out - network/firewall issue');
  socket.destroy();
  process.exit(1);
});

socket.on('error', (err) => {
  console.log('❌ TCP connection failed:', err.message);
  socket.destroy();
  process.exit(1);
});