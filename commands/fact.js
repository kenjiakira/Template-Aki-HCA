const axios = require("axios");
const translate = require('translate-google');

module.exports = {
    name: "fact",
    usedby: 0,
    info: "Cung cấp một sự thật ngẫu nhiên",
    dev: "Jonell Magallanes",
    onPrefix: true,
    usages: "fact",
    cooldowns: 5,

    onLaunch: async function ({ api, event }) {
        try {
         
            const response = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
            const randomFact = response.data.text; 

            const translatedFact = await translate(randomFact, { to: 'vi' });

            const factMessage = `🤯 Sự thật ngẫu nhiên: ${translatedFact}`;
            return api.sendMessage(factMessage, event.threadID, event.messageID);

        } catch (error) {
            console.error(error);
            return api.sendMessage("❌ Đã xảy ra lỗi khi lấy sự thật ngẫu nhiên hoặc dịch nội dung. Vui lòng thử lại sau.", event.threadID, event.messageID);
        }
    }
};
