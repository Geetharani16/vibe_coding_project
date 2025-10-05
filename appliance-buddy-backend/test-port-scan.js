import net from 'net';

const HOST = 'sgkirxqorrongtknnkzt.supabase.co';
const PORTS = [5432, 443, 80, 22];

async function testPort(port) {
  return new Promise((resolve) => {
    console.log(`Testing ${HOST}:${port}...`);
    
    const socket = net.createConnection(port, HOST);
    socket.setTimeout(5000); // 5 second timeout
    
    socket.on('connect', () => {
      console.log(`✅ Port ${port} is open!`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Port ${port} timed out`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Port ${port} failed: ${err.message}`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function testAllPorts() {
  console.log(`Testing multiple ports on ${HOST}...`);
  
  for (const port of PORTS) {
    await testPort(port);
  }
}

testAllPorts();