import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==================================================');
console.log('🚀 STARTING PROJECTLENS AI (Backend & Frontend)...');
console.log('==================================================\n');

// Detect Python executable
let pythonCmd = 'python';
const venvWin = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
const venvUnix = path.join(__dirname, '.venv', 'bin', 'python');

if (fs.existsSync(venvWin)) {
  pythonCmd = venvWin;
} else if (fs.existsSync(venvUnix)) {
  pythonCmd = venvUnix;
}

// 1. Start Python FastAPI Backend
console.log(`⚡ Launching Python FastAPI Backend on http://localhost:8000 using [${pythonCmd}] ...`);
const backend = spawn(pythonCmd, ['-m', 'backend.main'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, PYTHONUNBUFFERED: '1' },
});

// Detect frontend runner (prefer bun if available, else npm.cmd on Windows, npm on Unix)
const isWin = process.platform === 'win32';
const frontendCmd = typeof process.versions.bun !== 'undefined' ? 'bun' : (isWin ? 'npm.cmd' : 'npm');

// 2. Start Vite React Frontend
console.log(`⚡ Launching React Vite Frontend on http://localhost:5173 using [${frontendCmd} run dev] ...`);
const frontend = spawn(frontendCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: isWin,
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

