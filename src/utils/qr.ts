/**
 * Pure TypeScript QR Code generator (Version 1-10 Byte Mode, ECC L/M)
 * Generates an SVG or matrix without any external dependencies.
 */

// Simple QR code matrix generator for URL strings
export function generateQRMatrix(text: string): boolean[][] {
  // Use a reliable mini QR encoder or fall back to algorithmic matrix with functional timing/finder patterns
  return createQRMatrix(text);
}

// Polynomials and tables for Reed-Solomon Error Correction
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

(function initGalois() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  EXP_TABLE[255] = EXP_TABLE[0];
})();

function glog(n: number) {
  if (n < 1) throw new Error('glog(' + n + ')');
  return LOG_TABLE[n];
}
function gexp(n: number) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return EXP_TABLE[n];
}

function polyMul(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      if (p1[i] !== 0 && p2[j] !== 0) {
        result[i + j] ^= gexp(glog(p1[i]) + glog(p2[j]));
      }
    }
  }
  return result;
}

function getGeneratorPoly(degree: number): number[] {
  let g = [1];
  for (let i = 0; i < degree; i++) {
    g = polyMul(g, [1, gexp(i)]);
  }
  return g;
}

function calcEcc(data: number[], eccCount: number): number[] {
  const gen = getGeneratorPoly(eccCount);
  const msg = [...data, ...new Array(eccCount).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gexp(glog(gen[j]) + glog(coef));
      }
    }
  }
  return msg.slice(data.length);
}

// Version table for byte mode (Version, Total Codewords, ECC Codewords)
// Using Version 4 (33x33) or Version 6 (41x41) or Version 8 (49x49) based on length
interface QRVersionInfo {
  version: number;
  size: number;
  dataBytes: number;
  eccBytes: number;
  alignment: number[];
}

const VERSIONS: QRVersionInfo[] = [
  { version: 1, size: 21, dataBytes: 19, eccBytes: 7, alignment: [] },
  { version: 2, size: 25, dataBytes: 34, eccBytes: 10, alignment: [6, 18] },
  { version: 3, size: 29, dataBytes: 55, eccBytes: 15, alignment: [6, 22] },
  { version: 4, size: 33, dataBytes: 80, eccBytes: 20, alignment: [6, 26] },
  { version: 5, size: 37, dataBytes: 108, eccBytes: 26, alignment: [6, 30] },
  { version: 6, size: 41, dataBytes: 136, eccBytes: 18 * 2, alignment: [6, 34] },
  { version: 7, size: 45, dataBytes: 156, eccBytes: 20 * 2, alignment: [6, 22, 38] },
  { version: 8, size: 49, dataBytes: 194, eccBytes: 24 * 2, alignment: [6, 24, 42] },
];

function createQRMatrix(text: string): boolean[][] {
  const utf8 = new TextEncoder().encode(text);
  const dataLen = utf8.length;

  let chosen = VERSIONS[0];
  for (const v of VERSIONS) {
    // 4 bits mode + 8/16 bits count + data
    const charCountBits = v.version >= 10 ? 16 : 8;
    const requiredBits = 4 + charCountBits + dataLen * 8;
    if (Math.ceil(requiredBits / 8) <= v.dataBytes) {
      chosen = v;
      break;
    }
    chosen = v;
  }

  const size = chosen.size;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isReserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean, reserved = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (reserved) isReserved[r][c] = true;
    }
  }

  // 1. Finder patterns at (0,0), (0, size-7), (size-7, 0)
  function drawFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          setModule(nr, nc, true);
        } else {
          setModule(nr, nc, false);
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Alignment patterns
  if (chosen.alignment.length > 0) {
    for (const r of chosen.alignment) {
      for (const c of chosen.alignment) {
        if (isReserved[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setModule(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isReserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!isReserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  setModule(size - 8, 8, true);

  // 5. Reserve format info areas
  for (let i = 0; i <= 8; i++) {
    if (!isReserved[8][i]) isReserved[8][i] = true;
    if (!isReserved[i][8]) isReserved[i][8] = true;
    if (!isReserved[8][size - 1 - i]) isReserved[8][size - 1 - i] = true;
    if (!isReserved[size - 1 - i][8]) isReserved[size - 1 - i][8] = true;
  }

  // 6. Build data bits
  const bitBuffer: number[] = [];
  function putBits(num: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      bitBuffer.push((num >> i) & 1);
    }
  }

  // Byte mode indicator: 0100
  putBits(0b0100, 4);
  const charBits = chosen.version >= 10 ? 16 : 8;
  putBits(dataLen, charBits);
  for (let i = 0; i < dataLen; i++) {
    putBits(utf8[i], 8);
  }

  // Terminator
  const totalDataBits = chosen.dataBytes * 8;
  const termLen = Math.min(4, totalDataBits - bitBuffer.length);
  for (let i = 0; i < termLen; i++) bitBuffer.push(0);

  // Pad to byte
  while (bitBuffer.length % 8 !== 0) bitBuffer.push(0);

  // Pad bytes: 0xEC, 0x11
  const pad = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuffer.length < totalDataBits) {
    putBits(pad[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bitBuffer.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bitBuffer[i + b];
    }
    dataBytes.push(byte);
  }

  // Calculate ECC
  const ecc = calcEcc(dataBytes, chosen.eccBytes);
  const finalCodewords = [...dataBytes, ...ecc];

  // Convert all to bits
  const allBits: number[] = [];
  for (const byte of finalCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push((byte >> b) & 1);
    }
  }

  // 7. Place data into matrix using standard zigzag
  let bitIdx = 0;
  let upwards = true;
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing column
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const col of [c, c - 1]) {
        if (!isReserved[r][col]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx] : 0;
          // Apply standard mask 0: (r + col) % 2 === 0
          const mask = (r + col) % 2 === 0;
          const val = (bit === 1) !== mask;
          setModule(r, col, val, false);
          bitIdx++;
        }
      }
    }
    upwards = !upwards;
  }

  // 8. Format Info (Mask 0, ECC Level L => 01 000 with BCH => 0x77c4 ^ 0x5412 = 0x23d6)
  // Format string for L, mask 0 is: 0b111011111000100
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];

  // Top-left format info
  for (let i = 0; i <= 5; i++) setModule(8, i, formatBits[i] === 1, false);
  setModule(8, 7, formatBits[6] === 1, false);
  setModule(8, 8, formatBits[7] === 1, false);
  setModule(7, 8, formatBits[8] === 1, false);
  for (let i = 9; i < 15; i++) setModule(14 - i, 8, formatBits[i] === 1, false);

  // Top-right and bottom-left format info
  for (let i = 0; i < 8; i++) {
    setModule(8, size - 1 - i, formatBits[i] === 1, false);
  }
  for (let i = 8; i < 15; i++) {
    setModule(size - 15 + i, 8, formatBits[i] === 1, false);
  }

  return matrix.map(row => row.map(cell => !!cell));
}
