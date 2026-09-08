const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🌱 STARTING SCRAP SATHI FULL-STACK ECOSYSTEM');
console.log('🏆 Smart India Hackathon 2026 · Problem Statement 26229');
console.log('🏛️ Ministry of Mines (MoM) · JNARDDC · Kabadiwala Connect');
console.log('================================================================');

// 1. Start Server on port 5000
const server = spawn('node', ['server/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite Client on port 5173
const client = spawn('npm', ['--prefix', 'client', 'run', 'dev', '--', '--host'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nStopping Scrap Sathi dev processes...');
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
