const translate = require('translate-google');
const { getInfoFromName } = require('mal-scraper');
const request = require('request');
const fs = require('fs');
const path = require ('path');

module.exports = {
    name: "anime",
    info: "Tìm kiếm thông tin Anime.",
    dev: "ZiaRein",
    onPrefix: true,
    dmUser: false,
    nickName: ["anime"],
    usages: "anime [tên anime cần tìm]",
    cooldowns: 5,

    onLaunch: async function ({ api, event, target, actions }) {
        const query = target.join(" ").trim(); 
        
        if (!query) {
            return await actions.reply("❎ Vui lòng cung cấp tên anime cần tìm kiếm.\nUsage: anime [tên anime cần tìm]");
        }

        try {
            const Anime = await getInfoFromName(query);
            const getURL = Anime.picture;
            const ext = getURL.substring(getURL.lastIndexOf(".") + 1);
            const imagePath = path.join(__dirname, 'cache', `mal.${ext}`)

            if (!Anime.genres || Anime.genres.length === 0) Anime.genres = ["Không có"];
            

            const title = Anime.title;
            const japTitle = Anime.japaneseTitle;
            const type = Anime.type;
            const status = Anime.status;
            const premiered = Anime.premiered;
            const broadcast = Anime.broadcast;
            const aired = Anime.aired;
            const producers = Anime.producers;
            const studios = Anime.studios;
            const source = Anime.source;
            const episodes = Anime.episodes;
            const duration = Anime.duration;
            const genres = Anime.genres.join(", ");
            const popularity = Anime.popularity;
            const ranked = Anime.ranked;
            const score = Anime.score;
            const rating = Anime.rating;
            const synopsis = Anime.synopsis;
            const url = Anime.url;

            const translatedSynopsis = await translate(synopsis, { from: 'en', to: 'vi' });

            const callback = function () {
                actions.send({
                    body: `📖 THÔNG TIN ANIME\n\n🎥 Tên: ${title}\n🎌 Tên tiếng Nhật: ${japTitle}\n📺 Loại: ${type}\n⚡️ Trạng thái: ${status}\n🗓️ Khởi chiếu: ${premiered}\n📡 Phát sóng: ${broadcast}\n📅 Ra mắt: ${aired}\n🎬 Nhà sản xuất: ${producers}\n🎓 Studio: ${studios}\n📝 Nguồn: ${source}\n🎞️ Số tập: ${episodes}\n⌛️ Thời lượng: ${duration}\n🎭 Thể loại: ${genres}\n🌟 Độ phổ biến: ${popularity}\n🔝 Xếp hạng: ${ranked}\n🎖️ Điểm số: ${score}\n🔞 Đánh giá: ${rating}\n\n📝 Nội dung:\n${translatedSynopsis}\n\n🌐 Link chi tiết: ${url}`,
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID, () => {
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }, event.messageID);
            };

            request(getURL).pipe(fs.createWriteStream(imagePath)).on("close", callback);

        } catch (err) {
            return await actions.reply("⚠️ " + err.message);
        }
    }
};
