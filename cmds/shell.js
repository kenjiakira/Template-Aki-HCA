const { exec } = require('child_process');

module.exports = {
    name: "shell",
    usedby: 2,
    info: "Thực thi lệnh shell",
    onPrefix: true,
    nickName: ["exec", "linux"],
    dev: "Jonell Magallanes",
    cooldowns: 3,
    dmUser: false,
    usages: "shell <lệnh>",

    onLaunch: async function ({ api, event, target }) {
        const { threadID, messageID } = event;
        const command = target.join(" ");

        if (!command) {
            return api.sendMessage("Vui lòng cung cấp lệnh shell để thực thi.", threadID, messageID);
        }

        const teh = await api.sendMessage("Đang xử lý", threadID, messageID);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return api.editMessage(`Lỗi: ${error.message}`, teh.messageID, threadID, messageID);
            }
            if (stderr) {
                return api.editMessage(`Stderr: ${stderr}`, teh.messageID, threadID, messageID);
            }
            api.editMessage(`${stdout}`, teh.messageID, threadID, messageID);
        });
    }
}
