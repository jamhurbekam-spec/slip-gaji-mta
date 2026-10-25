const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 1. Create SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.4" />
    </filter>
  </defs>
  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />
  
  <!-- Outer decorative card / receipt -->
  <g filter="url(#shadow)">
    <rect x="96" y="76" width="320" height="360" rx="28" fill="#ffffff" />
    <!-- Receipt top band -->
    <path d="M96 104 C96 88.536 108.536 76 124 76 H388 C403.464 76 416 88.536 416 104 V136 H96 Z" fill="#0284c7" />
    
    <!-- Receipt tooth bottom decoration -->
    <path d="M96 408 L116 436 L136 408 L156 436 L176 408 L196 436 L216 408 L236 436 L256 408 L276 436 L296 408 L316 436 L336 408 L356 436 L376 408 L396 436 L416 408 V404 H96 Z" fill="#0284c7" opacity="0.15" />
    
    <!-- Currency / Rupiah / Payroll badge in header -->
    <circle cx="256" cy="180" r="38" fill="#eff6ff" stroke="#2563eb" stroke-width="4" />
    <text x="256" y="193" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="#1d4ed8" text-anchor="middle">Rp</text>
    
    <!-- Receipt Lines -->
    <rect x="146" y="246" width="220" height="14" rx="7" fill="#cbd5e1" />
    <rect x="146" y="276" width="160" height="12" rx="6" fill="#e2e8f0" />
    <rect x="146" y="302" width="220" height="12" rx="6" fill="#e2e8f0" />
    
    <!-- Total highlight line -->
    <rect x="146" y="336" width="220" height="2" fill="#cbd5e1" />
    <rect x="146" y="352" width="130" height="16" rx="8" fill="#10b981" />
    <rect x="296" y="352" width="70" height="16" rx="8" fill="#047857" />
  </g>
</svg>`;

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// PNG Builder Helper
function makePng(width, height, drawFn) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Function to draw App Icon (Receipt/Slip with blue theme)
function renderAppIcon(x, y, w, h, isMaskable = false) {
  // Normalized 0..1 coordinates
  const nx = x / w;
  const ny = y / h;

  // Background gradient: from #1e3a8a (30, 58, 138) to #3b82f6 (59, 130, 246)
  const t = (nx + ny) / 2;
  const bgR = Math.round(30 * (1 - t) + 37 * t);
  const bgG = Math.round(58 * (1 - t) + 99 * t);
  const bgB = Math.round(138 * (1 - t) + 235 * t);

  // If not maskable, round corners with radius 20%
  if (!isMaskable) {
    const cornerR = 0.2;
    // Check if outside rounded rect
    let dx = 0;
    let dy = 0;
    if (nx < cornerR) dx = cornerR - nx;
    else if (nx > 1 - cornerR) dx = nx - (1 - cornerR);
    if (ny < cornerR) dy = cornerR - ny;
    else if (ny > 1 - cornerR) dy = ny - (1 - cornerR);

    if (dx > 0 && dy > 0 && Math.sqrt(dx * dx + dy * dy) > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside icon corner
    }
  }

  // Draw white receipt card inside icon
  // For maskable, safe zone is 0.15 to 0.85
  const cardLeft = isMaskable ? 0.25 : 0.22;
  const cardRight = isMaskable ? 0.75 : 0.78;
  const cardTop = isMaskable ? 0.20 : 0.18;
  const cardBottom = isMaskable ? 0.80 : 0.82;

  if (nx >= cardLeft && nx <= cardRight && ny >= cardTop && ny <= cardBottom) {
    // Card header (blue band at top of receipt)
    if (ny <= cardTop + 0.12) {
      return [2, 132, 199, 255]; // Teal/Blue #0284c7
    }

    // Inside white paper
    // Check if on decorative horizontal lines
    const lineXStart = cardLeft + 0.08;
    const lineXEnd = cardRight - 0.08;

    // Line 1: Rp Badge Circle
    const circleCenterX = (cardLeft + cardRight) / 2;
    const circleCenterY = cardTop + 0.22;
    const cDist = Math.sqrt((nx - circleCenterX) ** 2 + (ny - circleCenterY) ** 2);
    if (cDist < 0.075) {
      if (cDist > 0.065) return [37, 99, 235, 255]; // Border
      return [239, 246, 255, 255]; // Light blue fill
    }

    // Text bar 1
    if (nx >= lineXStart && nx <= lineXEnd && ny >= cardTop + 0.33 && ny <= cardTop + 0.36) {
      return [203, 213, 225, 255]; // Slate 300
    }
    // Text bar 2
    if (nx >= lineXStart && nx <= lineXStart + 0.28 && ny >= cardTop + 0.40 && ny <= cardTop + 0.43) {
      return [226, 232, 240, 255]; // Slate 200
    }
    // Text bar 3
    if (nx >= lineXStart && nx <= lineXEnd && ny >= cardTop + 0.46 && ny <= cardTop + 0.485) {
      return [226, 232, 240, 255]; // Slate 200
    }
    // Green Total line
    if (nx >= lineXStart && nx <= lineXEnd && ny >= cardTop + 0.52 && ny <= cardTop + 0.57) {
      return [16, 185, 129, 255]; // Emerald 500
    }

    return [255, 255, 255, 255]; // White paper
  }

  // Background
  return [bgR, bgG, bgB, 255];
}

// Generate files
console.log('Generating PWA icons...');
const icon192 = makePng(192, 192, (x, y, w, h) => renderAppIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = makePng(512, 512, (x, y, w, h) => renderAppIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = makePng(512, 512, (x, y, w, h) => renderAppIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleIcon = makePng(180, 180, (x, y, w, h) => renderAppIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

console.log('All PWA icons generated successfully in /public!');
