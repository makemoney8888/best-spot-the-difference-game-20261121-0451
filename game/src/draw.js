// Twin Lanterns — the painters. Every thing that can appear in a picture is one small function
// here that draws it from its parameters on a canvas context, in picture coordinates (the
// picture is PANEL.size square, origin at its top-left). drawPanelScene paints a whole panel:
// the sky-to-ground backdrop, then the scene's elements in order. The left panel paints the
// elements as listed; the right panel paints them with the scene's differences applied — an
// element patched, hidden, or one extra element added — which is the whole trick of the game:
// one painter, two parameter sets, two near-identical pictures.

import { PANEL } from './config.js';
import { scatter } from './random.js';

/** A rounded rectangle path (not filled or stroked — the caller decides). */
export function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function disc(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}

function glow(ctx, x, y, radius, colour) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, colour);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function paintStarfield(ctx, el) {
  ctx.fillStyle = el.colour;
  for (const star of scatter(el.seed, el.count, el.x, el.y, el.width, el.height)) {
    ctx.globalAlpha = 0.35 + star.size * 0.6;
    disc(ctx, star.x, star.y, 0.8 + star.size * 1.5);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function paintStar(ctx, el) {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.fillStyle = el.colour;
  ctx.beginPath();
  for (let point = 0; point < 8; point += 1) {
    const angle = (point * Math.PI) / 4 - Math.PI / 2;
    const radius = point % 2 === 0 ? el.r : el.r * 0.38;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (point === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function paintMoon(ctx, el) {
  glow(ctx, el.x, el.y, el.r * 3.1, 'rgba(240,230,190,0.20)');
  ctx.fillStyle = el.colour;
  disc(ctx, el.x, el.y, el.r);
  ctx.fill();
  if (el.phase === 'crescent') {
    ctx.fillStyle = el.skyColour;
    disc(ctx, el.x + el.r * 0.45, el.y - el.r * 0.28, el.r * 0.86);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(160,150,110,0.35)';
    disc(ctx, el.x - el.r * 0.3, el.y + el.r * 0.2, el.r * 0.16);
    ctx.fill();
    disc(ctx, el.x + el.r * 0.25, el.y - el.r * 0.35, el.r * 0.11);
    ctx.fill();
  }
}

function paintCloud(ctx, el) {
  ctx.save();
  ctx.globalAlpha = el.alpha;
  ctx.fillStyle = el.colour;
  for (const puff of [[0, 0, 26], [-24, 6, 18], [24, 6, 20], [-6, -10, 19]]) {
    disc(ctx, el.x + puff[0] * el.scale, el.y + puff[1] * el.scale, puff[2] * el.scale);
    ctx.fill();
  }
  ctx.restore();
}

function paintSkyline(ctx, el) {
  const next = scatter(el.seed, 40, 0, 0, 1, 1);
  ctx.fillStyle = el.colour;
  ctx.beginPath();
  ctx.moveTo(0, el.base);
  let x = 0;
  let index = 0;
  while (x < PANEL.size) {
    const width = 34 + next[index % next.length].size * 46;
    const top = el.base - 26 - next[(index + 7) % next.length].size * 52;
    ctx.lineTo(x, top);
    ctx.lineTo(x + width * 0.5, top - 10 - next[(index + 3) % next.length].size * 12);
    ctx.lineTo(x + width, top);
    ctx.lineTo(x + width, el.base);
    x += width;
    index += 1;
  }
  ctx.lineTo(PANEL.size, el.base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = el.windowColour;
  for (let i = 0; i < next.length; i += 2) {
    const wx = next[i].x * PANEL.size;
    const wy = el.base - 14 - next[i].size * 44;
    if (next[i].size > 0.45) ctx.fillRect(wx, wy, 4, 6);
  }
}

function paintLanternShape(ctx, x, y, r, colour) {
  glow(ctx, x, y, r * 2.6, 'rgba(255,190,90,0.28)');
  const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r * 1.15);
  gradient.addColorStop(0, '#fff3cf');
  gradient.addColorStop(0.45, colour);
  gradient.addColorStop(1, colour);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,40,20,0.45)';
  ctx.lineWidth = 1.2;
  for (const fx of [-0.55, 0, 0.55]) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * Math.abs(fx) + 0.001, r * 0.82, 0, 0, Math.PI * 2);
    if (fx === 0) ctx.stroke();
  }
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(x - r * 0.34, y - r * 0.98, r * 0.68, r * 0.2);
  ctx.fillRect(x - r * 0.34, y + r * 0.78, r * 0.68, r * 0.2);
  ctx.strokeStyle = '#c33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.98);
  ctx.lineTo(x, y + r * 1.3);
  ctx.stroke();
}

function paintLanternString(ctx, el) {
  ctx.strokeStyle = 'rgba(20,16,30,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(el.x1, el.y1);
  ctx.quadraticCurveTo((el.x1 + el.x2) / 2, Math.max(el.y1, el.y2) + el.sag, el.x2, el.y2);
  ctx.stroke();
  for (let i = 0; i < el.count; i += 1) {
    const t = (i + 0.5) / el.count;
    const x = (1 - t) * (1 - t) * el.x1 + 2 * (1 - t) * t * ((el.x1 + el.x2) / 2) + t * t * el.x2;
    const y = (1 - t) * (1 - t) * el.y1 + 2 * (1 - t) * t * (Math.max(el.y1, el.y2) + el.sag) + t * t * el.y2;
    ctx.strokeStyle = 'rgba(20,16,30,0.8)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 7);
    ctx.stroke();
    paintLanternShape(ctx, x, y + 7 + el.r * 0.82, el.r, el.colours[i % el.colours.length]);
  }
}

function paintStall(ctx, el) {
  ctx.fillStyle = el.body;
  ctx.fillRect(el.x, el.y, el.width, el.height);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(el.x, el.y + el.height - 12, el.width, 12);
  // The window: lamplit gold, or dark when the scene says the lamp is out.
  ctx.fillStyle = el.lit ? '#ffd98a' : '#2c3140';
  ctx.fillRect(el.x + 16, el.y + 34, el.width * 0.42, el.height - 62);
  ctx.strokeStyle = el.trim;
  ctx.lineWidth = 3;
  ctx.strokeRect(el.x + 16, el.y + 34, el.width * 0.42, el.height - 62);
  ctx.beginPath();
  ctx.moveTo(el.x + 16 + el.width * 0.21, el.y + 34);
  ctx.lineTo(el.x + 16 + el.width * 0.21, el.y + el.height - 28);
  ctx.stroke();
  // Counter goods: little jars and buns in a row.
  ctx.fillStyle = el.trim;
  ctx.fillRect(el.x - 6, el.y + el.height - 30, el.width + 12, 8);
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = ['#d96f32', '#e8b23a', '#7fae4c', '#c94f6d'][i];
    disc(ctx, el.x + el.width * 0.62 + i * 17, el.y + el.height - 36, 6.5);
    ctx.fill();
  }
  // Striped awning.
  const awningHeight = 26;
  for (let i = 0; i < 8; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? el.awning : '#f3e9d2';
    ctx.beginPath();
    const sx = el.x - 8 + (i * (el.width + 16)) / 8;
    ctx.moveTo(sx, el.y + 6);
    ctx.lineTo(sx + (el.width + 16) / 8, el.y + 6);
    ctx.lineTo(sx + (el.width + 16) / 8 - 4, el.y + 6 + awningHeight);
    ctx.lineTo(sx + 4, el.y + 6 + awningHeight);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = el.trim;
  ctx.fillRect(el.x - 8, el.y, el.width + 16, 7);
  // Hanging sign with the shop's name.
  ctx.strokeStyle = el.trim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(el.x + el.width + 2, el.y + 10);
  ctx.lineTo(el.x + el.width + 2, el.y + 26);
  ctx.stroke();
  ctx.fillStyle = el.signColour;
  roundedRect(ctx, el.x + el.width - 26, el.y + 26, 56, 24, 4);
  ctx.fill();
  ctx.fillStyle = '#fdf6e0';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.sign, el.x + el.width + 2, el.y + 39);
}

function paintLanternPost(ctx, el) {
  ctx.strokeStyle = '#23202e';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(el.x, el.y);
  ctx.lineTo(el.x, el.y - el.height);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(el.x, el.y - el.height);
  ctx.quadraticCurveTo(el.x + 16, el.y - el.height - 6, el.x + 26, el.y - el.height + 8);
  ctx.stroke();
  paintLanternShape(ctx, el.x + 26, el.y - el.height + 8 + el.r, el.r, el.colour);
  ctx.fillStyle = '#23202e';
  ctx.fillRect(el.x - 12, el.y - 4, 24, 6);
}

function paintCat(ctx, el) {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.fillStyle = el.colour;
  ctx.beginPath(); // body, sitting
  ctx.ellipse(0, -12, 17, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  disc(ctx, -6, -30, 10.5); // head
  ctx.fill();
  ctx.beginPath(); // ears
  ctx.moveTo(-15, -36); ctx.lineTo(-13, -47); ctx.lineTo(-6, -39);
  ctx.moveTo(3, -39); ctx.lineTo(9, -47); ctx.lineTo(11, -36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = el.colour; // tail: curled up, or lying flat
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (el.tail === 'up') {
    ctx.moveTo(15, -6);
    ctx.quadraticCurveTo(27, -10, 24, -26);
  } else {
    ctx.moveTo(15, -4);
    ctx.quadraticCurveTo(28, -2, 33, -8);
  }
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8'; // eyes: two calm slits of lamplight
  ctx.fillRect(-11, -32, 4, 2.4);
  ctx.fillRect(-1, -32, 4, 2.4);
  ctx.restore();
}

function paintCrates(ctx, el) {
  for (let i = 0; i < el.count; i += 1) {
    const cx = el.x + (i % 2) * 34 - (i === 2 ? 17 : 0);
    const cy = el.y - Math.floor(i / 2) * 32 - (i === 2 ? 32 : 0);
    ctx.fillStyle = '#8a6134';
    ctx.fillRect(cx, cy, 32, 30);
    ctx.strokeStyle = '#5f3f1e';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, 32, 30);
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + 32, cy + 30);
    ctx.moveTo(cx + 32, cy); ctx.lineTo(cx, cy + 30);
    ctx.stroke();
  }
}

function paintBarrel(ctx, el) {
  ctx.fillStyle = '#6e4a26';
  ctx.beginPath();
  ctx.ellipse(el.x, el.y - 22, 17, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3d2812';
  ctx.lineWidth = 3;
  for (const dy of [-36, -22, -8]) {
    ctx.beginPath();
    ctx.ellipse(el.x, el.y + dy, 16.4, 5.5, 0, 0, Math.PI);
    ctx.stroke();
  }
}

function paintBanner(ctx, el) {
  ctx.fillStyle = el.colour;
  ctx.fillRect(el.x, el.y, el.width, el.height);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(el.x, el.y, el.width, 6);
  ctx.fillStyle = '#fdf6e0';
  for (let i = 0; i < el.glyphs; i += 1) {
    disc(ctx, el.x + el.width / 2, el.y + 26 + i * 26, 6);
    ctx.fill();
    ctx.fillRect(el.x + el.width / 2 - 6, el.y + 33 + i * 26, 12, 2.4);
  }
}

function paintRoomWall(ctx, el) {
  ctx.fillStyle = el.wall;
  ctx.fillRect(0, 0, PANEL.size, el.floorY);
  ctx.fillStyle = el.wainscot;
  ctx.fillRect(0, el.floorY - 64, PANEL.size, 64);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(0, el.floorY - 64, PANEL.size, 5);
  ctx.fillStyle = el.floor;
  ctx.fillRect(0, el.floorY, PANEL.size, PANEL.size - el.floorY);
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, el.floorY + 16 + i * 17);
    ctx.lineTo(PANEL.size, el.floorY + 10 + i * 17);
    ctx.stroke();
  }
}

function paintClock(ctx, el) {
  glow(ctx, el.x, el.y, el.r * 1.7, 'rgba(255,220,150,0.12)');
  ctx.fillStyle = '#3a2a18';
  disc(ctx, el.x, el.y, el.r + 6);
  ctx.fill();
  ctx.fillStyle = '#f7ecd2';
  disc(ctx, el.x, el.y, el.r);
  ctx.fill();
  ctx.fillStyle = '#3a2a18';
  for (let i = 0; i < 12; i += 1) {
    const angle = (i * Math.PI) / 6;
    const long = i % 3 === 0;
    ctx.save();
    ctx.translate(el.x + Math.cos(angle) * el.r * 0.82, el.y + Math.sin(angle) * el.r * 0.82);
    ctx.rotate(angle);
    ctx.fillRect(-1.4, -1.4, long ? 9 : 5.5, 2.8);
    ctx.restore();
  }
  const hourAngle = (((el.hour % 12) + el.minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minuteAngle = (el.minute / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#2c1f10';
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(el.x, el.y);
  ctx.lineTo(el.x + Math.cos(hourAngle) * el.r * 0.52, el.y + Math.sin(hourAngle) * el.r * 0.52);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(el.x, el.y);
  ctx.lineTo(el.x + Math.cos(minuteAngle) * el.r * 0.78, el.y + Math.sin(minuteAngle) * el.r * 0.78);
  ctx.stroke();
  ctx.fillStyle = '#a33327';
  disc(ctx, el.x, el.y, 4.5);
  ctx.fill();
}

function paintShelf(ctx, el) {
  ctx.fillStyle = '#5f4126';
  ctx.fillRect(el.x, el.y, el.width, 9);
  ctx.fillStyle = '#46301b';
  ctx.fillRect(el.x + 10, el.y + 9, 10, 14);
  ctx.fillRect(el.x + el.width - 20, el.y + 9, 10, 14);
}

function paintJar(ctx, el) {
  ctx.fillStyle = el.body;
  roundedRect(ctx, el.x, el.y, el.width, el.height, 6);
  ctx.fill();
  ctx.fillStyle = el.liquid;
  roundedRect(ctx, el.x + 3, el.y + el.height * 0.38, el.width - 6, el.height * 0.56, 4);
  ctx.fill();
  ctx.fillStyle = '#3d2812';
  ctx.fillRect(el.x + 2, el.y - 5, el.width - 4, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(el.x + 5, el.y + 6, 4, el.height - 14);
}

function paintBook(ctx, el) {
  ctx.fillStyle = el.colour;
  ctx.fillRect(el.x, el.y, el.width, el.height);
  ctx.fillStyle = 'rgba(255,246,220,0.85)';
  ctx.fillRect(el.x, el.y + 5, el.width, 3);
  ctx.fillRect(el.x, el.y + el.height - 8, el.width, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(el.x + el.width - 4, el.y, 4, el.height);
}

function paintGear(ctx, el) {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate(el.angle);
  ctx.fillStyle = el.colour;
  ctx.beginPath();
  const teeth = el.teeth;
  for (let i = 0; i < teeth; i += 1) {
    const a = (i / teeth) * Math.PI * 2;
    const bx = Math.cos(a) * el.r * 0.86;
    const by = Math.sin(a) * el.r * 0.86;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(a);
    ctx.rect(-el.r * 0.13, -el.r * 0.16, el.r * 0.3, el.r * 0.32);
    ctx.restore();
  }
  ctx.fill();
  disc(ctx, 0, 0, el.r * 0.88);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  disc(ctx, 0, 0, el.r * 0.34);
  ctx.fill();
  ctx.restore();
}

function paintLamp(ctx, el) {
  ctx.strokeStyle = '#2e2a33';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(el.x, el.y);
  ctx.lineTo(el.x + 8, el.y - 44);
  ctx.lineTo(el.x + 30, el.y - 58);
  ctx.stroke();
  ctx.fillStyle = '#2e2a33';
  ctx.fillRect(el.x - 13, el.y, 28, 6);
  if (el.on) glow(ctx, el.x + 38, el.y - 44, 66, 'rgba(255,205,105,0.5)');
  ctx.save();
  ctx.translate(el.x + 30, el.y - 58);
  ctx.rotate(0.5);
  ctx.fillStyle = el.on ? '#ffca66' : '#4a4a55';
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(22, 0);
  ctx.lineTo(30, 17);
  ctx.lineTo(-14, 17);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function paintTool(ctx, el) {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate(el.angle);
  ctx.fillStyle = '#8b8f98';
  ctx.strokeStyle = '#8b8f98';
  if (el.tool === 'hammer') {
    ctx.fillStyle = '#7a4a22';
    ctx.fillRect(-3, -4, 6, 34);
    ctx.fillStyle = '#8b8f98';
    ctx.fillRect(-13, -14, 27, 12);
    ctx.fillRect(11, -14, 7, 7);
  } else {
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(0, -2);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0.7, Math.PI * 2 - 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

function paintBench(ctx, el) {
  ctx.fillStyle = '#7a5228';
  ctx.fillRect(el.x, el.y, el.width, 14);
  ctx.fillStyle = '#5f3f1e';
  ctx.fillRect(el.x + 8, el.y + 14, 12, el.height);
  ctx.fillRect(el.x + el.width - 20, el.y + 14, 12, el.height);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(el.x, el.y + el.height + 14, el.width, 5);
  ctx.strokeStyle = 'rgba(46,30,12,0.5)';
  ctx.lineWidth = 1.4;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(el.x + (el.width / 4) * i, el.y + 2);
    ctx.lineTo(el.x + (el.width / 4) * i, el.y + 12);
    ctx.stroke();
  }
}

function paintWatch(ctx, el) {
  if (el.chain) {
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(el.x, el.y - 44);
    ctx.quadraticCurveTo(el.x + 12, el.y - 20, el.x, el.y - 6);
    ctx.stroke();
  }
  ctx.fillStyle = '#c9a227';
  disc(ctx, el.x, el.y + 8, 15);
  ctx.fill();
  ctx.fillStyle = '#f7ecd2';
  disc(ctx, el.x, el.y + 8, 11.5);
  ctx.fill();
  ctx.strokeStyle = '#2c1f10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(el.x, el.y + 8);
  ctx.lineTo(el.x + 5, el.y + 3);
  ctx.moveTo(el.x, el.y + 8);
  ctx.lineTo(el.x - 7, el.y + 6);
  ctx.stroke();
}

function paintStool(ctx, el) {
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.ellipse(el.x, el.y, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(el.x - 19, el.y + 2, 6, 26);
  ctx.fillRect(el.x + 13, el.y + 2, 6, 26);
  ctx.fillRect(el.x - 19, el.y + 16, 38, 4);
}

function paintRug(ctx, el) {
  ctx.fillStyle = el.colour;
  ctx.beginPath();
  ctx.ellipse(el.x, el.y, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(253,246,224,0.55)';
  ctx.lineWidth = 3;
  for (const scale of [0.72, 0.45]) {
    ctx.beginPath();
    ctx.ellipse(el.x, el.y, (el.width / 2) * scale, (el.height / 2) * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function paintWindowFrame(ctx, el) {
  ctx.fillStyle = '#1b2745';
  ctx.fillRect(el.x, el.y, el.width, el.height);
  paintStarfield(ctx, { seed: el.seed, count: 14, x: el.x + 4, y: el.y + 4, width: el.width - 8, height: el.height - 8, colour: '#dfe8ff' });
  ctx.fillStyle = '#f0e6c2';
  disc(ctx, el.x + el.width - 24, el.y + 24, 9);
  ctx.fill();
  ctx.strokeStyle = '#4a341f';
  ctx.lineWidth = 6;
  ctx.strokeRect(el.x, el.y, el.width, el.height);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(el.x + el.width / 2, el.y);
  ctx.lineTo(el.x + el.width / 2, el.y + el.height);
  ctx.moveTo(el.x, el.y + el.height / 2);
  ctx.lineTo(el.x + el.width, el.y + el.height / 2);
  ctx.stroke();
}

function paintSea(ctx, el) {
  ctx.fillStyle = el.colour;
  ctx.fillRect(0, el.base, PANEL.size, PANEL.size - el.base);
  const glints = scatter(el.seed, 60, 0, 0, 1, 1);
  ctx.fillStyle = 'rgba(240,230,190,0.5)';
  for (const g of glints) {
    const gx = 190 + (g.x - 0.5) * (60 + g.y * 190);
    const gy = el.base + 8 + g.y * (PANEL.size - el.base - 18);
    ctx.fillRect(gx, gy, 4 + g.size * 13, 2);
  }
  ctx.strokeStyle = 'rgba(190,215,255,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 36, el.base + 58 + i * 44);
    ctx.lineTo(74 + i * 36, el.base + 58 + i * 44);
    ctx.stroke();
  }
}

function paintLighthouse(ctx, el) {
  if (el.beam) {
    const gradient = ctx.createLinearGradient(el.x, el.y - el.height, el.x + 190, el.y - el.height + 44);
    gradient.addColorStop(0, 'rgba(255,236,170,0.5)');
    gradient.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(el.x, el.y - el.height + 4);
    ctx.lineTo(el.x + 190, el.y - el.height - 16);
    ctx.lineTo(el.x + 190, el.y - el.height + 62);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#2c3140';
  ctx.fillRect(el.x - 30, el.y - 8, 66, 10);
  for (let band = 0; band < 4; band += 1) {
    ctx.fillStyle = band % 2 === 0 ? '#e8e2d2' : '#b8433a';
    const by = el.y - 8 - (band + 1) * (el.height / 4) + 2;
    ctx.fillRect(el.x - 15 + band * 1.6, by, 34 - band * 3.2, el.height / 4);
  }
  ctx.fillStyle = '#23202e';
  ctx.fillRect(el.x - 11, el.y - el.height - 16, 26, 16);
  ctx.fillStyle = el.beam ? '#ffe89a' : '#565d6e';
  ctx.fillRect(el.x - 7, el.y - el.height - 13, 18, 10);
  if (el.beam) glow(ctx, el.x + 2, el.y - el.height - 8, 40, 'rgba(255,232,154,0.55)');
}

function paintBoat(ctx, el) {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.fillStyle = 'rgba(10,14,26,0.35)';
  ctx.beginPath();
  ctx.ellipse(6, 30, 74, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = el.hull;
  ctx.beginPath();
  ctx.moveTo(-62, 0);
  ctx.lineTo(62, 0);
  ctx.lineTo(44, 24);
  ctx.lineTo(-44, 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = el.trim;
  ctx.fillRect(-62, -5, 124, 6);
  ctx.strokeStyle = '#2c2015';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -96);
  ctx.stroke();
  ctx.fillStyle = el.sail;
  ctx.beginPath();
  ctx.moveTo(4, -92);
  ctx.lineTo(4, -8);
  ctx.lineTo(52, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = el.stripe;
  ctx.beginPath();
  ctx.moveTo(4, -58);
  ctx.lineTo(33, -8);
  ctx.lineTo(4, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8e2d2';
  ctx.beginPath();
  ctx.moveTo(-4, -84);
  ctx.lineTo(-4, -8);
  ctx.lineTo(-38, -8);
  ctx.closePath();
  ctx.fill();
  if (el.flag) {
    ctx.fillStyle = el.flagColour;
    ctx.beginPath();
    ctx.moveTo(0, -96);
    ctx.lineTo(20, -90);
    ctx.lineTo(0, -84);
    ctx.closePath();
    ctx.fill();
  }
  paintLanternShape(ctx, -48, 6, 7, '#e8542f');
  ctx.restore();
}

function paintOrangeCrate(ctx, el) {
  ctx.fillStyle = '#8a6134';
  ctx.fillRect(el.x, el.y, 64, 34);
  ctx.strokeStyle = '#5f3f1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(el.x, el.y, 64, 34);
  ctx.beginPath();
  ctx.moveTo(el.x, el.y + 17);
  ctx.lineTo(el.x + 64, el.y + 17);
  ctx.stroke();
  const spots = [[12, -4], [26, -8], [40, -5], [52, -8], [19, 6], [33, 4], [47, 6]];
  for (let i = 0; i < el.count; i += 1) {
    const [ox, oy] = spots[i % spots.length];
    ctx.fillStyle = '#e07f26';
    disc(ctx, el.x + ox, el.y + oy, 8);
    ctx.fill();
    ctx.fillStyle = '#4c7a34';
    ctx.fillRect(el.x + ox - 1, el.y + oy - 10, 3, 4);
  }
}

function paintQuay(ctx, el) {
  ctx.fillStyle = el.colour;
  ctx.fillRect(0, el.base, PANEL.size, PANEL.size - el.base);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(0, el.base, PANEL.size, 5);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 92 + 20, el.base + 4);
    ctx.lineTo(i * 92 + 12, PANEL.size);
    ctx.stroke();
  }
}

const PAINTERS = {
  starfield: paintStarfield,
  star: paintStar,
  moon: paintMoon,
  cloud: paintCloud,
  skyline: paintSkyline,
  lanternString: paintLanternString,
  stall: paintStall,
  lanternPost: paintLanternPost,
  cat: paintCat,
  crates: paintCrates,
  barrel: paintBarrel,
  banner: paintBanner,
  roomWall: paintRoomWall,
  clock: paintClock,
  shelf: paintShelf,
  jar: paintJar,
  book: paintBook,
  gear: paintGear,
  lamp: paintLamp,
  tool: paintTool,
  bench: paintBench,
  watch: paintWatch,
  stool: paintStool,
  rug: paintRug,
  windowFrame: paintWindowFrame,
  sea: paintSea,
  lighthouse: paintLighthouse,
  boat: paintBoat,
  orangeCrate: paintOrangeCrate,
  quay: paintQuay,
};

/**
 * The elements one panel paints: the scene's own list for the left picture; for the right,
 * the same list with every difference applied (patch an element, hide one, or add one).
 * Resolved once per scene and side, then reused every frame.
 */
export function elementsForSide(scene, side) {
  if (scene.resolvedSides === undefined) scene.resolvedSides = [scene.elements, null];
  if (side === 0) return scene.resolvedSides[0];
  if (scene.resolvedSides[1] !== null) return scene.resolvedSides[1];
  const replaced = new Map();
  const extras = [];
  for (const difference of scene.differences) {
    if (difference.hideEl !== undefined) replaced.set(difference.hideEl, null);
    else if (difference.patchEl !== undefined) {
      replaced.set(difference.patchEl, { ...scene.elements[difference.patchEl], ...difference.patch });
    } else if (difference.addEl !== undefined) extras.push(difference.addEl);
  }
  const resolved = [];
  scene.elements.forEach((element, index) => {
    if (!replaced.has(index)) resolved.push(element);
    else if (replaced.get(index) !== null) resolved.push(replaced.get(index));
  });
  scene.resolvedSides[1] = resolved.concat(extras);
  return scene.resolvedSides[1];
}

/** Paint one whole picture: backdrop gradient, then its elements in order. */
export function drawPanelScene(ctx, scene, side) {
  const backdrop = ctx.createLinearGradient(0, 0, 0, PANEL.size);
  backdrop.addColorStop(0, scene.backdropTop);
  backdrop.addColorStop(1, scene.backdropBottom);
  ctx.fillStyle = backdrop;
  ctx.fillRect(0, 0, PANEL.size, PANEL.size);
  for (const element of elementsForSide(scene, side)) {
    const painter = PAINTERS[element.kind];
    if (painter !== undefined) painter(ctx, element);
  }
}
