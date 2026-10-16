/* Numlings: turns pixel sprites into images and draws any Numling (normal, shiny, or silhouette) */
'use strict';
/* Pixel sprites are drawn once at startup; the vector art stays as a fallback. Sprites face right;
   opt.faceLeft (or flip: false) mirrors them. */
const PXIMG = {};
let spriteCanvas = null;
function spriteURL(grid, solid = null) {
  if (!spriteCanvas) { spriteCanvas = document.createElement('canvas'); spriteCanvas.width = PX; spriteCanvas.height = PX; }
  const g = spriteCanvas.getContext('2d'); g.clearRect(0, 0, PX, PX);
  grid.forEach((row, y) => row.forEach((c, x) => { if (c) { g.fillStyle = solid || c; g.fillRect(x, y, 1, 1); } }));
  return spriteCanvas.toDataURL('image/png');
}
function buildSprites() {
  try {
    const cv = document.createElement('canvas'); cv.width = PX; cv.height = PX;
    const g = cv.getContext('2d');
    for (const sp of SPECIES) {
      const grid = pxGrid(pxSpec(sp));
      PXIMG[sp.n] = { url: spriteURL(grid), sil: spriteURL(grid, '#5D6B8A') };
    }
  } catch (e) { console.warn('Pixel sprites unavailable, using vector art.', e); }
}
const art = (n, opt = {}) => {
  const im = PXIMG[n]; if (!im) return creatureSVG(SP[n], opt);
  const shiny = opt.shiny && !opt.sil;
  if (shiny && !im.shinyUrl) { try { im.shinyUrl = spriteURL(pxGrid(pxShinySpec(SP[n]))); } catch (e) { im.shinyUrl = im.url; } }
  const left = opt.faceLeft || opt.flip === false;
  const alt = opt.label === false ? '' : opt.sil ? 'Unknown Numling' : (shiny ? 'Shiny ' : '') + SP[n].name;
  const img = `<img class="art px${opt.sil ? ' sil' + (opt.faint ? ' faint' : '') : ''}${left ? ' face-left' : ''}" src="${opt.sil ? im.sil : shiny ? im.shinyUrl : im.url}" alt="${esc(alt)}" draggable="false">`;
  return shiny ? `<span class="shiny-wrap">${img}<i class="tw"></i><i class="tw"></i><i class="tw"></i></span>` : img;
};
const artC = (c, opt = {}) => art(c.n, { ...opt, shiny: !!c.shiny }); // draw a creature the student owns (or a wild one)
const shinyChip = '<span class="chip shiny-chip">✦ Shiny</span>';
