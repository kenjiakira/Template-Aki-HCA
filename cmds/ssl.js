const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
    name: "ssl",
    usedby: 0,
    info: "Chụp màn hình một URL được cung cấp Và kiểm tra SSL.",
    onPrefix: true,
    dev: "Jonell Magallanes",
    cooldowns: 6,
    dmUser: false,

    onLaunch: async function ({ api, event, target }) {
        const url = target[0];
        const device = target[1] || 'iphone 16 Pro Max';

        if (!url) {
            return api.sendMessage("Vui lòng cung cấp URL.", event.threadID, event.messageID);
        }

        const check = await api.sendMessage("Đang chụp màn hình.....", event.threadID, event.messageID);
        const filePath = path.join(__dirname, 'cache', `screenshot-${Date.now()}.png`);

        try {
            const screenshotResponse = await axios({
                method: 'get',
                url: `https://render-puppeteer-test-sspb.onrender.com/ss?url=${url}&device=${device}`,
                responseType: 'arraybuffer',
            });

            const statusCode = screenshotResponse.status;

            const certCheck = new Promise((resolve, reject) => {
                const req = https.get(url, (res) => {
                    const certificate = res.socket.getPeerCertificate();
                    if (Object.keys(certificate).length === 0) {
                        resolve('Không tìm thấy chứng chỉ SSL.');
                    } else {
                        const validFrom = new Date(certificate.valid_from);
                        const validTo = new Date(certificate.valid_to);
                        const currentDate = new Date();
                        if (currentDate >= validFrom && currentDate <= validTo) {
                            resolve('Chứng chỉ SSL hợp lệ.');
                        } else {
                            resolve('Chứng chỉ SSL không hợp lệ.');
                        }
                    }
                });

                req.on('error', (error) => reject('Lỗi khi kiểm tra chứng chỉ.'));
                req.end();
            });

            fs.writeFileSync(filePath, Buffer.from(screenshotResponse.data, 'binary'));

            api.unsendMessage(check.messageID);

            const certStatus = await certCheck;

            api.sendMessage({
                body: `Ảnh chụp màn hình của ${url} trên thiết bị ${device}\nMã trạng thái: ${statusCode}\nTrạng thái chứng chỉ: ${certStatus}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath);
            }, event.messageID);

        } catch (error) {
            console.error(error);
            return api.sendMessage(error.message, event.threadID, event.messageID);
        }
    }
}
