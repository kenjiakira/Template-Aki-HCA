const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    name: "video",
    usedby: 0,
    version: "1.0.0",
    info: "Tải video",
    onPrefix: true,
    dev: "Jonell Magallanes",
    cooldowns: 10,

    onLaunch: async function ({ api, event, target }) {
        if (!target[0]) {
            return api.sendMessage(`❌ Vui lòng nhập tên video!`, event.threadID);
        }

        try {
            const videoQuery = target.join(" ");
            const findingMessage = await api.sendMessage(`🔍 | Đang tìm "${videoQuery}". Vui lòng chờ...`, event.threadID);

            const searchResults = await yts(videoQuery);
            const firstResult = searchResults.videos[0];

            if (!firstResult) {
                await api.editMessage(`❌ | Không tìm thấy kết quả cho "${videoQuery}".`, findingMessage.messageID, event.threadID);
                return;
            }

            const { title, url } = firstResult;

            await api.editMessage(`⏱️ | Đã tìm thấy video: "${title}". Đang tải xuống...`, findingMessage.messageID);

            const filePath = path.resolve(__dirname, 'cache', `${Date.now()}-${title}.mp4`);

            const responseStream = ytdl(url, {
                filter: 'audioandvideo',  
                quality: 'highest',       
                highWaterMark: 1 << 25   
            });

            const fileStream = fs.createWriteStream(filePath);

            responseStream.pipe(fileStream);

            fileStream.on('finish', async () => {
                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 25) {
                    await api.editMessage(`❌ | Kích thước tệp vượt quá giới hạn 25MB. Không thể gửi video "${title}".`, findingMessage.messageID, event.threadID);
                    fs.unlinkSync(filePath);
                    return;
                }

                const bold = global.fonts.bold("Trình phát video");
                await api.sendMessage({
                    body: `📹 ${bold}\n${global.line}\nĐây là video bạn tìm kiếm "${videoQuery}"\n\nTiêu đề: ${title}\nLiên kết Youtube: ${url}`,
                    attachment: fs.createReadStream(filePath)
                }, event.threadID);

                fs.unlinkSync(filePath);
                api.unsendMessage(findingMessage.messageID);
            });

            responseStream.on('error', async (error) => {
                console.error(error);
                await api.editMessage(`❌ | Lỗi: ${error.message}`, findingMessage.messageID, event.threadID);
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            console.error(error);
            await api.editMessage(`❌ | Lỗi: ${error.message}`, findingMessage.messageID, event.threadID);
        }
    }
};
