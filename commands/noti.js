module.exports = {
  name: "noti",
  usedby: 2,
  onPrefix: true,
  dev: "HNT",
  info: "Tin nhắn từ Admin",
  cooldowns: 30,
  onLaunch: async function({ api, event, target }) {
    const content = target.join(" ");
    const hasAttachments = event.messageReply?.attachments?.length > 0;
    
    if (!content && !hasAttachments) {
      return api.sendMessage("⚠️ Vui lòng nhập nội dung và/hoặc reply media để thông báo!", event.threadID);
    }

    let senderName = "Admin";
    try {
      let senderInfo = await api.getUserInfo(event.senderID);
      if (senderInfo && senderInfo[event.senderID]) {
        senderName = senderInfo[event.senderID].name;
      }
    } catch (error) {
      console.log(`Failed to get sender name: ${error}`);
    }

    let messageObject = {
      body: `📢 THÔNG BÁO QUAN TRỌNG 📢\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `${content}\n\n` +
        `👤 Người gửi: ${senderName}\n` +
        `⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📌 Lưu ý: Đây là thông báo chính thức từ Admin\n` +
        `💌 Hãy phản hồi nếu bạn có thắc mắc`
    };

    if (hasAttachments) {
      messageObject.attachment = event.messageReply.attachments;
    }

    try {
      let threads = await api.getThreadList(500, null, ['INBOX']);
      let threadIDs = threads
        .filter(thread => thread.isGroup)
        .map(thread => thread.threadID);

      let successCount = 0;
      for (const id of threadIDs) {
        try {
          await api.sendMessage(messageObject, id);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          continue;
        }
      }

      api.sendMessage(
        `📊 BÁO CÁO GỬI THÔNG BÁO\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `✅ Đã gửi thành công: ${successCount}/${threadIDs.length} nhóm\n` +
        `📎 Số file đính kèm: ${messageObject.attachment?.length || 0}\n` +
        `⏱️ Thời gian hoàn thành: ${new Date().toLocaleString('vi-VN')}`,
        event.threadID
      );
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('❌ Đã xảy ra lỗi khi gửi thông báo.', event.threadID);
    }
  }
};