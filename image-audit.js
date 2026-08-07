const fs = require('fs');
const path = require('path');
const dir = path.join('src','assets');
const exts = new Set(['.jpg','.jpeg','.png','.webp','.gif']);
function jpegSize(buf){let pos = 2;while(pos < buf.length){if(buf[pos] !== 0xFF) break;let marker = buf[pos+1];let len = buf.readUInt16BE(pos+2);if((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) || (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)){return {w: buf.readUInt16BE(pos+7), h: buf.readUInt16BE(pos+5)};}pos += 2 + len;}return null;}
function pngSize(buf){if(buf.length < 24) return null;return {w: buf.readUInt32BE(16), h: buf.readUInt32BE(20)};}
function webpSize(buf){if(buf.length < 30) return null;const riff = buf.toString('ascii', 0, 4);const webp = buf.toString('ascii', 8, 12);if(riff === 'RIFF' && webp === 'WEBP'){const fmt = buf.toString('ascii', 12, 16);if(fmt === 'VP8 '){const w = buf.readUInt16LE(26) & 0x3FFF;const h = buf.readUInt16LE(28) & 0x3FFF;return {w,h};}if(fmt === 'VP8L'){const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];const width = 1 + (((b1 & 0x3F) << 8) | b0);const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));return {w: width, h: height};}if(fmt === 'VP8X'){const w = 1 + ((buf[24]) | (buf[25] << 8) | (buf[26] << 16));const h = 1 + ((buf[27]) | (buf[28] << 8) | (buf[29] << 16));return {w,h};}}return null;}
function gifSize(buf){if(buf.length < 10) return null;return {w: buf.readUInt16LE(6), h: buf.readUInt16LE(8)};}
function getInfo(file){const buf = fs.readFileSync(file);const ext = path.extname(file).toLowerCase();let fmt = 'unknown';let size = null;let alpha = false;if(ext === '.png'){fmt='PNG';size=pngSize(buf);alpha=true;}else if(ext==='.jpg'||ext==='.jpeg'){fmt='JPEG';size=jpegSize(buf);alpha=false;}else if(ext==='.webp'){fmt='WEBP';size=webpSize(buf);alpha=false;}else if(ext==='.gif'){fmt='GIF';size=gifSize(buf);alpha=false;}return {fmt,size,alpha};}
const files = fs.readdirSync(dir).filter(f => exts.has(path.extname(f).toLowerCase())).sort();
const out = files.map(file => {
  const full = path.join(dir, file);
  try {
    const st = fs.statSync(full);
    const info = getInfo(full);
    const orientation = info.size ? (info.size.w > info.size.h ? 'Landscape' : info.size.w < info.size.h ? 'Portrait' : 'Square') : 'Unknown';
    return { file, format: info.fmt, size: info.size ? `${info.size.w}x${info.size.h}` : 'unknown', orientation, alpha: info.alpha, bytes: st.size };
  } catch (err) {
    return { file, error: err.message };
  }
});
console.log(JSON.stringify(out, null, 2));