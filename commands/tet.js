const moment = require('moment-timezone');

module.exports = {
  name: "tet",
  dev: "HNT",
  description: "Đếm ngược thời gian đến Tết Âm Lịch.",
  usages: "tet",
  onPrefix: true,
  cooldowns: 5,

  onLaunch: async function({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const now = moment.tz("Asia/Ho_Chi_Minh");

      const lunarNewYear = moment.tz("2024-02-10 00:00:00", "Asia/Ho_Chi_Minh");

      const diff = lunarNewYear.diff(now);
      if (diff <= 0) {
        return api.sendMessage("Tết đã đến! Chúc mừng năm mới! 🎉", threadID, messageID);
      }

      const duration = moment.duration(diff);
      const days = duration.days();
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      const message = `🎆 Đếm ngược đến Tết Âm Lịch 🎇\n\n` +
                      `Còn ${days} ngày, ${hours} giờ, ${minutes} phút, và ${seconds} giây nữa là đến Tết Âm Lịch! 🧧✨\n` +
                      `Chúc bạn chuẩn bị một cái Tết thật vui vẻ!`;

      api.sendMessage(message, threadID, messageID);
    } catch (error) {
      console.error("Lỗi khi đếm ngược đến Tết:", error);
      api.sendMessage("Đã xảy ra lỗi khi đếm ngược đến Tết. Vui lòng thử lại sau.", threadID, messageID);
    }
  }
};
