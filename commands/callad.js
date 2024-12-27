const fs = require('fs');
const adminConfig = JSON.parse(fs.readFileSync('admin.json', 'utf8'));

module.exports = {
    name: "callad",
    info: "Gửi tin nhắn cho admin",
    dev: "HNT", //ERROR ONREPLY
    onPrefix: true,
    dmUser: false,
    nickName: ["callad"],
    usages: "callad <nội dung báo cáo>",
    cooldowns: 5,

    onLaunch: async function ({ api, event, target }) {
        if (!target[0]) {
            return api.sendMessage(
                "⚠️ Bạn chưa nhập nội dung để báo cáo.",
                event.threadID,
                event.messageID
            );
        }

        const userInfo = await api.getUserInfo(event.senderID);
        const senderName = userInfo[event.senderID]?.name || "Người dùng không xác định";
        const senderID = event.senderID;
        const threadID = event.threadID;
        const threadInfo = await api.getThreadInfo(threadID);
        const threadName = threadInfo.threadName;
        const currentTime = require("moment-timezone").tz("Asia/Ho_Chi_Minh").format("HH:mm:ss D/MM/YYYY");

        api.sendMessage(
            `⏰ Báo cáo của bạn đã được gửi đến quản trị viên.\nThời gian: ${currentTime}`,
            event.threadID,
            event.messageID
        );

        const adminList = adminConfig.adminUIDs;
        if (!adminList || adminList.length === 0) {
            return api.sendMessage("⚠️ Không có admin nào được cấu hình!", event.threadID);
        }

        for (let adminID of adminList) {
            api.sendMessage(
                `👤 Report from: ${senderName}\n👨‍👩‍👧‍👧 Box: ${threadName}\n🔰 ID Box: ${threadID}\n🔷 ID User: ${senderID}\n-----------------\n⚠️ Nội dung: ${target.join(" ")}\n-----------------\n⏰ Time: ${currentTime}`,
                adminID
            );
        }

        global.client.onReply.push({
            name: this.name,
            messageID: event.messageID,
            author: senderID,
            threadID: threadID,
        });
    },

    onReply: async function ({ api, event, messageID, author, threadID }) {
        const { senderID, message } = event;

        const adminList = adminConfig.adminUIDs;
        if (!adminList.includes(senderID)) {
            return api.sendMessage("⚠️ Bạn không phải là quản trị viên, không thể trả lời báo cáo này.", threadID, messageID);
        }

        const replyMessage = `👨‍💼 Quản trị viên đã trả lời:\n\n${message}`;

        api.sendMessage(replyMessage, author, messageID);
    }
};
