const fs = require('fs');

const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));

module.exports = {
  name: "unsend",
  usedby: 0,
  dev: "Jonell Magallanes",
  onPrefix: false,
  cooldowns: 1,
  info: "Hủy tin nhắn",

  onLaunch: async function ({ api, event }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const userIsGroupAdmin = threadInfo.adminIDs.some(idInfo => idInfo.id === event.senderID);
    const userIsConfigAdmin = adminConfig.adminUIDs.includes(event.senderID);

    if (!userIsGroupAdmin && !userIsConfigAdmin) {
      return api.sendMessage("Bạn không phải là quản trị viên của nhóm này, bạn không thể sử dụng lệnh này.", event.threadID);
    }

    if (event.type !== "message_reply") {
      return api.sendMessage("Vui lòng trả lời một tin nhắn để sử dụng lệnh này.", event.threadID);
    }

    if (event.messageReply.senderID !== api.getCurrentUserID()) {
      return api.sendMessage("Bạn chỉ có thể sử dụng lệnh này như một phản hồi cho tin nhắn của chính bạn.", event.threadID);
    }

    return api.unsendMessage(event.messageReply.messageID);
  }
};
