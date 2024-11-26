const handleLogSubscribe = async (api, event, adminConfig) => {
    try {
        
        if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
            await api.changeNickname(
                `${adminConfig.botName} • [ ${adminConfig.prefix} ]`,
                event.threadID,
                api.getCurrentUserID()
            );
            return api.shareContact(
                `✅ 𝗕𝗼𝘁 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n${adminConfig.botName} Bot đã kết nối thành công!\nGõ "${adminConfig.prefix}help all" để xem toàn bộ lệnh.\n\nLiên hệ: ${adminConfig.ownerName}`,
                api.getCurrentUserID(),
                event.threadID
            );
        }

        const { threadID } = event;
        const threadInfo = await api.getThreadInfo(threadID);

        let threadName = threadInfo.threadName || "Unnamed group";
        let { participantIDs } = threadInfo;
        let addedParticipants = event.logMessageData.addedParticipants;

        for (let newParticipant of addedParticipants) {
            let userID = newParticipant.userFbId;

            if (userID === api.getCurrentUserID()) continue;

            let userInfo = await api.getUserInfo(userID);
            let userName = userInfo[userID]?.name?.replace("@", "") || "User";

            await api.shareContact(
                `🎉 Xin chào ${userName}!\nChào mừng bạn đến với nhóm "${threadName}"!\nBạn là thành viên thứ ${participantIDs.length} của nhóm này.\n\nChúc bạn vui vẻ khi tham gia nhóm nha! 😊`,
                userID,
                threadID
            );
        }
    } catch (error) {
        console.error("Lỗi trong handleLogSubscribe:", error);
        api.sendMessage("❌ Đã xảy ra lỗi trong quá trình xử lý thành viên mới.", event.threadID);
    }
};

module.exports = { handleLogSubscribe };
