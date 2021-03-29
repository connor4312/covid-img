const { promises: fs } = require('fs');
const playwright = require('playwright');
const pngquant = require('pngquant-bin');
const { Command } = require('commander');
const os = require('os');
const { join } = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');

async function main(opts) {
  let width;
  let height;
  const [rw, rh] = opts.ratio.split(':').map(Number);
  const ratio = rw / rh;
  if (ratio > 1) {
    height = opts.size;
    width = Math.round(opts.size * ratio);
  } else {
    width = opts.size;
    height = Math.round(opts.size / ratio);
  }

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  await page.goto(`${opts.addr}/?isolated&w=${width}&h=${height}`);
  await page.waitForTimeout(1000);

  const screenshot = await page.screenshot();
  await browser.close();

  const tmpfile = join(os.tmpdir(), `covid-img-${Date.now()}.png`);
  try {
    await fs.writeFile(tmpfile, screenshot);
    await promisify(execFile)(pngquant, ['-o', join(process.cwd(), opts.out), tmpfile]);
  } catch (e) {
    await fs.unlink(tmpfile).catch(() => {});
    throw e;
  }
}

const program = new Command()
  .option('--addr <addr>', 'Address where the img server is running', 'http://localhost:5000')
  .option('-r, --ratio <ratio>', 'Aspect ratio in the form w:h', '8.5:11')
  .option('-s, --size <pixels>', 'Size of the smallest dimension in pixels', 10000)
  .option('-o, --out <file>', 'Output filename', 'image.png')
  .parse(process.argv);

main(program.opts());
