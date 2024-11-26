const axios = require('axios');

module.exports = {
    name: "shortenurl",
    info: "Rút gọn liên kết dài thành liên kết ngắn.",
    dev: "HNT",
    onPrefix: true,
    dmUser: false,
    nickName: ["shortenurl"],
    usages: "shortenurl [URL]",
    cooldowns: 5,

    onLaunch: async function ({ api, event, target, actions }) {
        const longUrl = target.join(' ').trim();

        if (!longUrl) {
            return await actions.reply("❎ Bạn cần cung cấp liên kết để rút gọn. Ví dụ: shortenurl https://www.example.com");
        }

        try {
            const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
            const shortUrl = response.data;

            if (shortUrl && shortUrl.startsWith('http')) {
                await actions.reply(`✅ Liên kết rút gọn của bạn là: ${shortUrl}`);
            } else {
                await actions.reply("❌ Đã xảy ra lỗi khi rút gọn liên kết. Vui lòng thử lại sau.");
            }
        } catch (error) {
            await actions.reply("⚠️ Không thể rút gọn liên kết vào lúc này. Vui lòng thử lại sau.");
        }
    }
};
