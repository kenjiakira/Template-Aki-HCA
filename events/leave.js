const fs = require('fs');
const path = require('path');

module.exports = {
    name: "leave",
    info: "Xử lý khi thành viên rời nhóm",

    onEvents: async function({ api, event, Threads }) {
        const { threadID, logMessageType, logMessageData } = event;
        
        if (logMessageType !== "log:unsubscribe") return;

        const antioutPath = path.join(__dirname, '../commands/json/antiout.json');
        if (!fs.existsSync(antioutPath)) return;
        
        const antioutData = JSON.parse(fs.readFileSync(antioutPath));
        if (!antioutData[threadID]) return;

        const leftParticipantFbId = event.logMessageData.leftParticipantFbId || 
                                   event.logMessageData.participantFbId;
        
        try {
            if (leftParticipantFbId == api.getCurrentUserID()) return;
            
            const isKicked = event.author !== leftParticipantFbId;
            if (isKicked) return; 
            
            const userName = (await api.getUserInfo(leftParticipantFbId))[leftParticipantFbId].name;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await api.addUserToGroup(leftParticipantFbId, threadID);
            
            api.sendMessage(
                `🔒 Đã thêm ${userName} trở lại nhóm!\n⚠️ Nhóm đang bật chế độ chống rời nhóm.`,
                threadID
            );
        } catch (error) {
            console.error("Anti-out error:", error);
            api.sendMessage(
                "⚠️ Không thể thêm lại thành viên vào nhóm. Có thể bot không phải là quản trị viên hoặc người dùng đã chặn bot.",
                threadID
            );
        }
    }
};
