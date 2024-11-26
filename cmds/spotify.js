const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const streamPipeline = promisify(require('stream').pipeline);

const cacheDir = path.resolve(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirsSync(cacheDir);
}

async function getAccessToken() {
    const clientID = '3d659375536044498834cc9012c58c44';
    const clientSecret = '73bc86542acb4593b2b217616189d4dc';
    
    const response = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
            grant_type: 'client_credentials'
        }), 
        {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    
    return response.data.access_token;
}

async function searchSpotify(query) {
    const accessToken = await getAccessToken();
    
    const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
            q: query,
            type: 'track,album',
            limit: 1
        },
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    const track = response.data.tracks.items[0];
    if (!track) {
        throw new Error('Không tìm thấy bài hát hoặc album với từ khóa này.');
    }

    return {
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        preview_url: track.preview_url,
        image_url: track.album.images[0].url
    };
}

async function downloadTrackPreview(url, outputPath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    await streamPipeline(response.data, fs.createWriteStream(outputPath));
}

module.exports = {
    name: "spotify",
    info: "Tìm kiếm thông tin bài hát hoặc album từ Spotify.",
    dev: "HNT",
    onPrefix: true,
    dmUser: false,
    nickName: ["sp", "spot"],
    usages: "spotify [từ khóa]",
    cooldowns: 5,

    onLaunch: async function ({ api, event, target }) {
        const { threadID, messageID } = event;
        const query = target && target.length > 0 ? target.join(' ') : null;
        
        if (!query) {
            return api.sendMessage('💬 Vui lòng cung cấp từ khóa tìm kiếm. Ví dụ: spotify Shape of You', threadID, messageID);
        }

        try {
            const trackInfo = await searchSpotify(query);
            const filePath = path.resolve(cacheDir, `${trackInfo.id}.mp3`);
            
            if (trackInfo.preview_url) {
                await downloadTrackPreview(trackInfo.preview_url, filePath);
                const message = `🎵 **Thông tin bài hát** 🎵\n\n` +
                                `🎤 Tên bài hát: ${trackInfo.name}\n` +
                                `🎶 Nghệ sĩ: ${trackInfo.artists}\n` +
                                `💿 Album: ${trackInfo.album}\n` +
                                `🔗 Xem thêm: [Link nghe](https://open.spotify.com/track/${trackInfo.id})\n` +
                                `🎧 nghe trước:`;

                api.sendMessage({
                    body: message,
                    attachment: fs.createReadStream(filePath)
                }, threadID, async () => {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (unlinkError) {
                        console.error(`Không thể xóa tệp ${filePath}: ${unlinkError.message}`);
                    }
                }, messageID);
            } else {
                const message = `🎵 **Thông tin bài hát** 🎵\n\n` +
                                `🎤 Tên bài hát: ${trackInfo.name}\n` +
                                `🎶 Nghệ sĩ: ${trackInfo.artists}\n` +
                                `💿 Album: ${trackInfo.album}\n` +
                                `🔗 Xem thêm: [Link nghe](https://open.spotify.com/track/${trackInfo.id})\n` +
                                `🎧 nghe trước: Không có`;
                api.sendMessage(message, threadID, messageID);
            }
        } catch (error) {
            api.sendMessage(`🚫 Lỗi: ${error.message}`, threadID, messageID);
        }
    }
};
