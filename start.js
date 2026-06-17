import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT ?? '8080';
const require = createRequire(import.meta.url);
const serveBin = require.resolve('serve/build/main.js');

const child = spawn(
	process.execPath,
	[serveBin, resolve(__dirname, 'build'), '-l', String(port), '-s'],
	{ stdio: 'inherit' }
);

child.on('exit', (code) => process.exit(code ?? 0));
