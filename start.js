import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==================================================');
console.log('🚀 STARTING PROJECTLENS AI (Backend & Frontend)...');
console.log('==================================================\n');

// 1. Start Python FastAPI Backend
console.log('⚡ Launching Python FastAPI Backend on http://localhost:8000 ...');
const backend = spawn('python', ['-m', 'backend.main'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PYTHONUNBUFFERED: '1' },
});

// 2. Start Vite React Frontend
console.log('⚡ Launching React Vite Frontend on http://localhost:5173 ...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n🛑 Shutting down ProjectLens AI services...');
  try {
    backend.kill();
  } catch (_) {}
  try {
    frontend.kill();
  } catch (_) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
