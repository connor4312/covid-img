const { readFileSync } = require('fs');

const byteMap = {
  A: 0,
  C: 1,
  G: 2,
  T: 3,
};

const contents = readFileSync(process.argv[2], 'utf8')
  .replace(/[^ACGT]/g, '')
  .split('')
  .map((c) => byteMap[c]);

const bytes = Math.ceil(contents.length / 4);
const encoded = Buffer.alloc(bytes);
for (let byte = 0; byte < bytes; byte++) {
  let n = 0;
  for (let i = 0; i < 4 && byte * 4 + i < contents.length; i++) {
    n = (n << 2) | contents[byte * 4 + i];
  }

  encoded[byte] = n;
}

console.log(encoded.toString('hex'));

const decoded = [];
const encodedStr = encoded.toString('hex');
for (let i = 0; i < encodedStr.length; i += 2) {
  let int = parseInt(encodedStr.slice(i, i + 2), 16);
  for (let i = 3; i >= 0; i--) {
    decoded.push((int >>> (i * 2)) & 3);
  }
}
