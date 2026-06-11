/**
 * Telegram/Number Info Command
 * COMMAND: .tginfo
 * USAGE: .tginfo <username OR number>
 */

/**
 * Telegram Username Info Command
 * COMMAND: .tginfo
 * Integration: RapidAPI Telegram Scraper
 */

/**
 * Telegram/Number Info Command
 * COMMAND: .tginfo
 * USAGE: .tginfo <username OR number>
 */

/**
 * Telegram Username Info Command
 * COMMAND: .tginfo
 * Integration: RapidAPI Telegram Scraper
 */

'use strict';
const axios = require('axios');

module.exports = {
  name: 'tginfo',
  async execute(sock, msg, args, extra) {
    const { reply, react } = extra;
    let username = args.join(' ').replace('@', '').trim();
    
    if (!username) {
      return reply("❌ *Error:* Please provide a username.");
    }

    await react('🔍');

    try {
      // Logic: @username format maintain karna
      const tg_id = `@${username}`;
      const url = `https://wasifali-telegram-id-to-number.vercel.app/api?userid=${tg_id}`;
      
      const apiRes = await axios.get(url, { timeout: 10000 });
      const data = apiRes.data;

      // Check success condition exactly as per your Python logic
      if (data.success === true || data.success === "true") {
        const resultText = 
          `✅ *DATA RETRIEVED SUCCESSFULLY!*\n\n` +
          `🌐 *User ID      :* ${data.user_id}\n` +
          `📍 *Country      :* ${data.country}\n` +
          `🔑 *Country Code :* ${data.country_code}\n` +
          `📞 *Phone Number :* ${data.country_code}${data.number}\n\n` +
          `_Powered by FAHDII Tool_`;

        await reply(resultText);
      } else {
        await reply("❌ *No details found or invalid Username!*");
      }

      await react('✅');

    } catch (e) {
      await reply("❌ *Connection Error!*");
      await react('❌');
    }
  }
};













