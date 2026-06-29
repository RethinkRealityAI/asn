const sharp = require('sharp');

const BASE = 'C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals/public';
const LOGO = BASE + '/brand/logo-blue-horizontal.png';
// Source logo: 1268x123. Originals are 1024x1024.

const LOGO_W = 280; // ~22px tall at this width — matches the small brand mark on the pail
const LOGO_H = Math.round(123 * (LOGO_W / 1268));
const PAIL_W = 1024;
const logoX = Math.round((PAIL_W - LOGO_W) / 2);
const patchW = 620;
const patchX = Math.round((PAIL_W - patchW) / 2);

const pails = [
  { src: 'C:/Temp/pail-shea-butter-orig.png', out: BASE + '/hero/pail-shea-butter.webp', logoY: 565, extraH: 0  },
  // cocoa-shea: fake italic text runs slightly below the patch — extra 30px covers it
  { src: 'C:/Temp/pail-cocoa-shea-orig.png',  out: BASE + '/hero/pail-cocoa-shea.webp',  logoY: 478, extraH: 30 },
  { src: 'C:/Temp/pail-argan-body-orig.png',  out: BASE + '/hero/pail-argan-body.webp',  logoY: 445, extraH: 0  },
];

async function run() {
  const logoBuffer = await sharp(LOGO).resize(LOGO_W).png().toBuffer();

  for (const p of pails) {
    const patchH = LOGO_H + 28 + (p.extraH || 0);
    const svgPatch = `<svg xmlns="http://www.w3.org/2000/svg" width="${patchW}" height="${patchH}"><rect width="100%" height="100%" fill="white"/></svg>`;
    const whitePatch = Buffer.from(svgPatch);

    await sharp(p.src)
      .composite([
        { input: whitePatch, left: patchX, top: p.logoY - 8, blend: 'over' },
        { input: logoBuffer, left: logoX,  top: p.logoY,     blend: 'over' },
      ])
      .webp({ quality: 92 })
      .toFile(p.out);
    console.log('done:', p.out);
  }
}

run().catch(console.error);
