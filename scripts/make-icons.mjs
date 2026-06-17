import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'static/icons');
mkdirSync(outDir, { recursive: true });

const svg = readFileSync(resolve(root, 'static/favicon.svg'));

async function render(size, name, padding = 0) {
	const inner = size - padding * 2;
	await sharp({
		create: { width: size, height: size, channels: 4, background: '#0d1117' }
	})
		.composite([
			{
				input: await sharp(svg).resize(inner, inner).png().toBuffer(),
				top: padding,
				left: padding
			}
		])
		.png()
		.toFile(resolve(outDir, name));
	console.log('wrote', name);
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await render(512, 'maskable-512.png', 64);
await render(180, 'apple-touch-180.png');
