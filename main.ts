// news-image-20261119 entry: validates entry.png against the gate, then copies it to the output directory.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Gate: whole PNG or JPEG file, at most 1 MiB, at most 1024x1024 pixels.

import { copyFileSync, mkdirSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1 << 20;          // 1 MiB
const MAX_DIM = 1024;
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIG = Buffer.from([0xff, 0xd8, 0xff]);

const source = new URL('./entry.png', import.meta.url);

// Reads a slice of the file without loading the whole image when it is not needed.
function readAt(fd: number, length: number, position = 0): Buffer {
  const buf = Buffer.alloc(length);
  const read = readSync(fd, buf, 0, length, position);
  return buf.subarray(0, read);
}

// Returns { kind, width, height } or throws with the reason the file fails the gate.
function inspect(path: URL): { kind: 'png' | 'jpeg'; width: number; height: number } {
  const { size } = statSync(path);
  if (size === 0) throw new Error('entry.png is empty');
  if (size > MAX_BYTES) {
    throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES}-byte limit`);
  }

  const fd = openSync(path, 'r');
  try {
    const head = readAt(fd, 32);

    if (head.subarray(0, 8).equals(PNG_SIG)) {
      // IHDR is the first chunk: length(4) type(4) data(13)
      const type = head.subarray(12, 16).toString('ascii');
      if (type !== 'IHDR') throw new Error('PNG is missing the IHDR chunk');
      const width = head.readUInt32BE(16);
      const height = head.readUInt32BE(20);
      return { kind: 'png', width, height };
    }

    if (head.subarray(0, 3).equals(JPEG_SIG)) {
      const { width, height } = jpegSize(fd, size);
      return { kind: 'jpeg', width, height };
    }

    throw new Error('entry.png is neither PNG nor JPEG');
  } finally {
    closeSync(fd);
  }
}

// Walks JPEG segments to the first SOFn frame header, which carries the dimensions.
function jpegSize(fd: number, size: number): { width: number; height: number } {
  let offset = 2;
  while (offset + 9 < size) {
    const marker = readAt(fd, 2, offset);
    if (marker[0] !== 0xff) throw new Error(`JPEG marker expected at ${offset}`);
    const code = marker[1];
    const len = readAt(fd, 2, offset + 2).readUInt16BE(0);
    const isFrame = code >= 0xc0 && code <= 0xcf && code !== 0xc4 && code !== 0xc8 && code !== 0xcc;
    if (isFrame) {
      const dims = readAt(fd, 5, offset + 4);
      return { height: dims.readUInt16BE(1), width: dims.readUInt16BE(3) };
    }
    offset += 2 + len;
  }
  throw new Error('JPEG has no frame header');
}

// A dimension of 0 is legal in the header but not decodable; if it appears, report the actual header
// bytes so a broken render is obvious in the log instead of failing silently at the judge.
function assertBounded(width: number, height: number): void {
  if (width <= 0 || height <= 0) throw new Error(`invalid dimensions ${width}x${height} in header`);
  if (width > MAX_DIM || height > MAX_DIM) {
    throw new Error(`entry.png is ${width}x${height}, over the ${MAX_DIM}x${MAX_DIM} limit`);
  }
}

function main(): void {
  const { kind, width, height } = inspect(source);
  assertBounded(width, height);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  copyFileSync(source, join(outDir, 'entry.png'));

  const { size } = statSync(source);
  console.log(`entry.png: ${kind.toUpperCase()} ${width}x${height}, ${(size / 1024).toFixed(0)} KiB -> ${join(outDir, 'entry.png')}`);
}

main();
