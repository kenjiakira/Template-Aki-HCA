const path = require('path');
const fs = require('fs');

module.exports = {
    name: "cmd",
    usedby: 0,
    info: "Triển khai hoặc xóa một lệnh đã chỉ định",
    onPrefix: true,
    cooldowns: 10,

    onLaunch: async function ({ event, api, target }) {
        const { threadID, messageID } = event;
        const action = target[0]?.toLowerCase();
        const commandName = target[1]?.toLowerCase();

        if (!action || !commandName) {
            return api.sendMessage("Vui lòng chỉ định hành động (deploy/delete) và tên lệnh.\n\nVí dụ: ?cmd deploy myCommand", threadID, messageID);
        }

        const cmdsFolder = path.join(__dirname);
        const commandFile = path.join(cmdsFolder, `${commandName}.js`);

        if (action === 'deploy') {
            if (!fs.existsSync(commandFile)) {
                return api.sendMessage(`Lệnh \`${commandName}\` không tồn tại trong thư mục cmds.`, threadID, messageID);
            }

            try {
                delete require.cache[require.resolve(commandFile)];
                require(commandFile);
                console.log(`Đã tải và triển khai lệnh: ${commandName}`);
                api.sendMessage(`Lệnh \`${commandName}\` đã được triển khai thành công.`, threadID, messageID);
            } catch (error) {
                console.error(error);
                api.sendMessage("Đã xảy ra lỗi khi triển khai lệnh.", threadID, messageID);
            }
        } else if (action === 'delete') {
            if (!fs.existsSync(commandFile)) {
                return api.sendMessage(`Lệnh \`${commandName}\` không tồn tại trong thư mục cmds.`, threadID, messageID);
            }

            try {
                fs.unlinkSync(commandFile);
                console.log(`Đã xóa lệnh: ${commandName}`);
                api.sendMessage(`Lệnh \`${commandName}\` đã được xóa thành công.`, threadID, messageID);
            } catch (error) {
                console.error(error);
                api.sendMessage("Đã xảy ra lỗi khi xóa lệnh.", threadID, messageID);
            }
        } else {
            api.sendMessage("Hành động không hợp lệ. Sử dụng `deploy` hoặc `delete`.", threadID, messageID);
        }
    }
};
