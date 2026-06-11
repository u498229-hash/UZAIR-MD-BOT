'use strict';

const axios  = require('axios');
const { toSmallCaps } = require('../utils/fonts');
const logger = require('../utils/logger');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const getMediaBuffer = async (msg) => {
  const message  = msg.message || {};
  const type     = Object.keys(message)[0];
  const mediaTypes = ['imageMessage','videoMessage','documentMessage','audioMessage','stickerMessage'];
  if (mediaTypes.includes(type)) {
    try { return await downloadMediaMessage(msg, 'buffer', {}); } catch { return null; }
  }
  const ctxInfo = message?.extendedTextMessage?.contextInfo || message?.[type]?.contextInfo || {};
  const quoted  = ctxInfo?.quotedMessage;
  if (quoted) {
    const qType = Object.keys(quoted)[0];
    if (mediaTypes.includes(qType)) {
      try {
        const fakeMsg = { key: { ...msg.key, id: ctxInfo.stanzaId || msg.key.id }, message: quoted };
        return await downloadMediaMessage(fakeMsg, 'buffer', {});
      } catch { return null; }
    }
  }
  return null;
};

const sticker = async (ctx) => {
  const { sock, from, msg, react } = ctx;
  await react('⏳');
  try {
    const buffer = await getMediaBuffer(msg);
    if (!buffer) { await react('❌'); return ctx.reply('❌ *Send or quote an image to make sticker!*'); }
    await sock.sendMessage(from, { sticker: buffer, mimetype: 'image/webp', packName: 'UZAIR MD', author: 'UZAIR MD' }, { quoted: msg });
    await react('✅');
  } catch (err) { await react('❌'); await ctx.reply('❌ *Failed!*'); }
};

const toimg = async (ctx) => {
  const { sock, from, msg, react } = ctx;
  await react('⏳');
  try {
    const buffer = await getMediaBuffer(msg);
    if (!buffer) { await react('❌'); return ctx.reply('❌ *Send or quote a sticker!*'); }
    await sock.sendMessage(from, { image: buffer, caption: '🖼️ Done!' }, { quoted: msg });
    await react('✅');
  } catch { await react('❌'); await ctx.reply('❌ *Failed!*'); }
};

const stickerinfo = async (ctx) => {
  const { msg, sock, from, react } = ctx;
  await react('ℹ️');
  try {
    const stk = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage || msg.message?.stickerMessage;
    if (!stk) return ctx.reply('❌ *Reply to a sticker!*');
    await sock.sendMessage(from, { text: `🎨 *Sticker Info*\n\n📦 Pack: ${stk.stickerPackName||'N/A'}\n✍️ Author: ${stk.stickerPackPublisher||'N/A'}` }, { quoted: msg });
  } catch { await ctx.reply('❌ *Failed!*'); }
};

const emojimix = async (ctx) => {
  const { sock, from, msg, args, react } = ctx;
  await react('⏳');
  try {
    const text = args.join(' ');
    const ems = text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu);
    if (!ems || ems.length < 2) return ctx.reply('❌ *Provide 2 emojis!*\nUsage: `.emojimix 😂 😭`');
    const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/${encodeURIComponent(ems[0])}/${encodeURIComponent(ems[0])}_${encodeURIComponent(ems[1])}.png`;
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    await sock.sendMessage(from, { sticker: Buffer.from(res.data), mimetype: 'image/webp' }, { quoted: msg });
    await react('✅');
  } catch { await react('❌'); await ctx.reply('❌ *Failed!*'); }
};

module.exports = { sticker, toimg, stickerinfo, emojimix };
