const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
    name: "update",
    usedby: 2,
    info: "Cập nhật bot từ Github",
    onPrefix: true,
    cooldowns: 30,

    onLaunch: async function({ api, event }) {
        const { threadID, messageID } = event;

        const REPO_OWNER = 'kenjiakira'; 
        const REPO_NAME = 'Template-Aki-HCA';
        const BRANCH = 'main';

        try {
            
            api.sendMessage("⚡️ Đang kiểm tra cập nhật hệ thống...", threadID);

            const headers = {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${process.env.GITHUB_TOKEN}`  
            };

            let currentVersion = '1.0.0';
            try {
                const versionData = JSON.parse(fs.readFileSync('./version.json', 'utf8'));
                currentVersion = versionData.version;
            } catch (err) {
                console.error("Không đọc được version.json:", err);
            }

            const { data: latestRelease } = await axios.get(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`,
                { headers }
            );

            const latestVersion = latestRelease.tag_name;

            if (currentVersion === latestVersion) {
                return api.sendMessage("✅ Bot đang ở phiên bản mới nhất!", threadID);
            }

            api.sendMessage(`⚡️ Đã phát hiện phiên bản mới ${latestVersion}\n🔄 Đang tiến hành cập nhật...`, threadID);

            const updateFiles = async () => {
              
                const backupFiles = [
                    './database',
                    './logins/hut-chat-api/config.json',
                    './admin.json'
                ];
                
                const backupDir = './backup-' + Date.now();
                fs.mkdirSync(backupDir);
                
                backupFiles.forEach(file => {
                    if (fs.existsSync(file)) {
                        const destPath = path.join(backupDir, path.basename(file));
                        if (fs.lstatSync(file).isDirectory()) {
                            fs.cpSync(file, destPath, {recursive: true});
                        } else {
                            fs.copyFileSync(file, destPath);
                        }
                    }
                });

                const restartData = { threadID: threadID };
                fs.writeFileSync('./database/threadID.json', JSON.stringify(restartData));

                const zipUrl = latestRelease.zipball_url;
                const { data } = await axios.get(zipUrl, { responseType: 'arraybuffer' });
                fs.writeFileSync('update.zip', data);

                exec('powershell Expand-Archive -Path update.zip -DestinationPath ./temp -Force', async (error) => {
                    if (error) {
                        console.error("Lỗi giải nén:", error);
                        return api.sendMessage("❌ Cập nhật thất bại: Lỗi giải nén", threadID);
                    }

                    exec('xcopy .\\temp\\*\\* . /E /H /C /I /Y', (error) => {
                        if (error) {
                            console.error("Lỗi copy file:", error);
                            return api.sendMessage("❌ Cập nhật thất bại: Lỗi copy file", threadID);
                        }

                        backupFiles.forEach(file => {
                            const backupPath = path.join(backupDir, path.basename(file));
                            if (fs.existsSync(backupPath)) {
                                if (fs.lstatSync(backupPath).isDirectory()) {
                                    fs.cpSync(backupPath, file, {recursive: true});
                                } else {
                                    fs.copyFileSync(backupPath, file);
                                }
                            }
                        });

                        fs.writeFileSync('./version.json', JSON.stringify({ version: latestVersion }));

                        fs.rmSync('./temp', { recursive: true, force: true });
                        fs.rmSync(backupDir, { recursive: true, force: true });
                        fs.unlinkSync('update.zip');

                        api.sendMessage("✅ Cập nhật hệ thống thành công! Đang khởi động lại bot...", threadID, () => {
                            process.exit(1);
                        });
                    });
                });
            };

            await updateFiles();

        } catch (err) {
            console.error(err);
            api.sendMessage("❌ Đã xảy ra lỗi trong quá trình cập nhật", threadID);
        }
    }
};
