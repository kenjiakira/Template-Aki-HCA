const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const execPromise = util.promisify(exec);

const threadsDB = JSON.parse(fs.readFileSync("./database/threads.json", "utf8") || "{}");
const usersDB = JSON.parse(fs.readFileSync("./database/users.json", "utf8") || "{}");

let commandCount = 0;
const botStartTime = Date.now();

module.exports = {
    name: "uptime",
    info: "Xem thời gian bot đã online và thông tin hệ thống.",
    dev: "HNT",
    onPrefix: false,
    dmUser: false,
    nickName: ["uptime", "thongtinhệthống"],
    usages: "uptime",
    cooldowns: 10,

    onLaunch: async function ({ api, event, actions }) {
        const { threadID, messageID } = event;

        const userCount = Object.keys(usersDB).length;
        const threadCount = Object.keys(threadsDB).length;

        const replyMessage = await actions.reply("Đang tải dữ liệu.......");
        await sleep(3000);  
        
        let currentTime = Date.now();
        let uptime = currentTime - botStartTime;
        let seconds = Math.floor((uptime / 1000) % 60);
        let minutes = Math.floor((uptime / (1000 * 60)) % 60);
        let hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        let days = Math.floor(uptime / (1000 * 60 * 60 * 24));

        let memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        let cpuLoad = os.loadavg()[0].toFixed(2); 

        const ping = await getPing();
        const systemInfo = await getSystemInfo();
        const nodeVersion = await getNodeVersion();
        const systemUptime = await getSystemUptime();

        let uptimeMessage = `⏱️ BOT UPTIME\n`;
        uptimeMessage += `=======================\n`;
        uptimeMessage += `🕒 Thời gian online: ${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây\n`;
        uptimeMessage += `🖥️ Thời gian hệ điều hành đã hoạt động: ${systemUptime}\n`;
        uptimeMessage += `=======================\n`;
        uptimeMessage += `📊 Số lệnh đã thực thi: ${commandCount}\n`;
        uptimeMessage += `💾 Bộ nhớ sử dụng: ${memoryUsage.toFixed(2)} MB\n`;
        uptimeMessage += `⚙️ CPU Load: ${cpuLoad}%\n`;
        uptimeMessage += `=======================\n`;
        uptimeMessage += `👤 Người dùng: ${userCount}\n`;
        uptimeMessage += `👥 Nhóm: ${threadCount}\n`;
        uptimeMessage += `=======================\n`;
        uptimeMessage += `🖥️ Hệ điều hành: ${systemInfo.platform} (${systemInfo.arch})\n`;
        uptimeMessage += `- Phiên bản: ${systemInfo.release}\n`;
        uptimeMessage += `- Tên máy: ${systemInfo.hostname}\n`;
        uptimeMessage += `- CPU Model: ${systemInfo.cpuModel} (${systemInfo.coreCount} core(s), ${systemInfo.cpuSpeed} MHz)\n`;
        uptimeMessage += `- Tổng bộ nhớ: ${systemInfo.totalMemory} GB\n`;
        uptimeMessage += `- Bộ nhớ còn lại: ${systemInfo.freeMemory} GB\n`;
        uptimeMessage += `- Bộ nhớ đã sử dụng: ${systemInfo.usedMemory} GB\n`;
        uptimeMessage += `=======================\n`;
        uptimeMessage += `🌐 Ping: ${ping}\n`;
        uptimeMessage += `=======================\n`;
        uptimeMessage += `🔢 Node.js Version: ${nodeVersion}\n`;
        
        await actions.edit(uptimeMessage, replyMessage.messageID);
    }
};

async function getPing() {
    try {
        const isWindows = os.platform() === 'win32';
        const pingCommand = isWindows ? 'ping -n 1 google.com' : 'ping -c 1 google.com';
        const { stdout } = await execPromise(pingCommand);
        const match = stdout.match(isWindows ? /time=(\d+)ms/ : /time=(\d+\.\d+) ms/);
        return match ? `${match[1]} ms` : 'N/A';
    } catch {
        return 'N/A';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getSystemInfo() {
    try {
        const platform = os.platform();
        const release = os.release();
        const arch = os.arch();
        const hostname = os.hostname();
        const cpuModel = os.cpus()[0].model;
        const coreCount = os.cpus().length;
        const cpuSpeed = os.cpus()[0].speed;
        const loadAverage = os.loadavg();
        const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2); 
        const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2); 
        const usedMemory = (totalMemory - freeMemory).toFixed(2);
        const uptime = os.uptime();

        return {
            platform,
            release,
            arch,
            hostname,
            cpuModel,
            coreCount,
            cpuSpeed,
            totalMemory,
            freeMemory,
            usedMemory,
            uptime,
        };
    } catch (error) {
        return {
            platform: 'N/A',
            release: 'N/A',
            arch: 'N/A',
            hostname: 'N/A',
            cpuModel: 'N/A',
            coreCount: 'N/A',
            cpuSpeed: 'N/A',
            totalMemory: 'N/A',
            freeMemory: 'N/A',
            usedMemory: 'N/A',
            uptime: 'N/A',
        };
    }
}

async function getNodeVersion() {
    try {
        const { stdout } = await execPromise('node -v');
        return stdout.trim();
    } catch {
        return 'N/A';
    }
}

async function getSystemUptime() {
    const sysUptimeDays = Math.floor(os.uptime() / (60 * 60 * 24));
    const sysUptimeHours = Math.floor((os.uptime() % (60 * 60 * 24)) / (60 * 60));
    const sysUptimeMinutes = Math.floor((os.uptime() % (60 * 60)) / 60);
    const sysUptimeSeconds = Math.floor(os.uptime() % 60);
    return `${sysUptimeDays} ngày, ${sysUptimeHours} giờ, ${sysUptimeMinutes} phút, ${sysUptimeSeconds} giây`;
}
