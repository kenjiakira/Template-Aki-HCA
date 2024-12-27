const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const { image } = require('image-downloader');

module.exports = {
  name: 'removebg',
  info: 'Tách Background ảnh',
  dev: 'HNT',
  onPrefix: true,
  dmUser: false,
  nickName: ['removebg'],
  usages: 'Reply ảnh để tách Background',
  cooldowns: 5,

  onLaunch: async function ({ api, event, actions }) {
    const successMessage = `📸[ TÁCH BACKGROUND ]📸
━━━━━━━━━━━━━━━
[✔️]➜ Tách Background thành công! Nền của ảnh bạn đã được loại bỏ.`;

    if (event.type !== "message_reply") {
      return await actions.reply("[❗]➜ Vui lòng reply một ảnh để thực hiện tách Background.");
    }

    if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return await actions.reply("[❗]➜ Bạn cần reply ít nhất một ảnh.");
    }

    if (event.messageReply.attachments[0].type !== "photo") {
      return await actions.reply("[❗]➜ Đối tượng reply không phải là ảnh.");
    }

    const content = event.messageReply.attachments[0].url;
    const KeyApi = [
      "t4Jf1ju4zEpiWbKWXxoSANn4",
      "CTWSe4CZ5AjNQgR8nvXKMZBd",
      "PtwV35qUq557yQ7ZNX1vUXED",
      "wGXThT64dV6qz3C6AhHuKAHV",
      "82odzR95h1nRp97Qy7bSRV5M",
      "4F1jQ7ZkPbkQ6wEQryokqTmo",
      "sBssYDZ8qZZ4NraJhq7ySySR",
      "NuZtiQ53S2F5CnaiYy4faMek",
      "f8fujcR1G43C1RmaT4ZSXpwW"
    ];
    
    const inputPath = path.resolve(__dirname, 'cache', 'photo.png');
    const outputPath = path.resolve(__dirname, 'cache', 'photo_removed_bg.png');

    try {
      await image({ url: content, dest: inputPath });

      const formData = new FormData();
      formData.append('size', 'auto');
      formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

      const response = await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: formData,
        responseType: 'arraybuffer',
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': KeyApi[Math.floor(Math.random() * KeyApi.length)],
        },
        encoding: null
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      fs.writeFileSync(outputPath, response.data);
      await actions.reply({ body: successMessage, attachment: fs.createReadStream(outputPath) });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

    } catch (error) {
      console.error('Lỗi:', error);
      await actions.reply(`[❗]➜ Đã xảy ra lỗi: ${error.message}. Vui lòng kiểm tra lại API Key hoặc thử lại sau.`);
      
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  }
};
