const handleLogUnsubscribe = async (api, event) => {
  
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  try {
      
      const { threadName, participantIDs } = await api.getThreadInfo(event.threadID);
      const isSelfLeave = event.author == event.logMessageData.leftParticipantFbId;
      const leftUserId = event.logMessageData.leftParticipantFbId;

      const userInfo = await api.getUserInfo(leftUserId);
      const userName = userInfo[leftUserId]?.name || "Người dùng không xác định";

      const adminInfo = isSelfLeave ? null : await api.getUserInfo(event.author);
      const adminName = adminInfo?.[event.author]?.name || "Quản trị viên không xác định";

      const actionType = isSelfLeave 
          ? "đã tự rời khỏi nhóm."
          : `đã bị đá bởi ${adminName}.`;

      await api.shareContact(
          `🚪 ${userName} ${actionType}\n📌 Nhóm: ${threadName || "Unnamed group"}\n👥 Thành viên còn lại: ${participantIDs.length}`,
          leftUserId,
          event.threadID
      );

      if (participantIDs.length < 5) {
          api.sendMessage(
              `⚠️ Cảnh báo: Nhóm "${threadName}" hiện chỉ còn ${participantIDs.length} thành viên!`,
              event.threadID
          );
      }

      // Lưu lịch sử sự kiện (tuỳ thích chọn cũng được , không thì thôi :))) )
      // logEventToFileOrDB({
      //     groupId: event.threadID,
      //     groupName: threadName,
      //     userName,
      //     actionType,
      //     timestamp: new Date()
      // });

  } catch (err) {
      console.error("ERROR trong handleLogUnsubscribe:", err);
      api.sendMessage("❌ Đã xảy ra lỗi khi xử lý sự kiện rời nhóm.", event.threadID);
  }
};

module.exports = { handleLogUnsubscribe };
