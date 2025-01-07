const axios = require('axios');
const translate = require('translate-google');

const OPENWEATHER_API_KEY = "1230a8fdc6457603234c68ead5f3f967";
const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

const ACCUWEATHER_API_KEY = "0Ux14sE88TUCC0vALojkwlWP47fjmIdK";
const ACCUWEATHER_URL = "http://dataservice.accuweather.com/currentconditions/v1/";

async function getWeatherFromOpenWeather(cityName) {
  const params = {
    q: cityName,
    appid: OPENWEATHER_API_KEY,
    units: "metric"
  };

  try {
    const response = await axios.get(OPENWEATHER_URL, { params });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi gọi OpenWeather API: ${error.response ? error.response.data.message : error.message}`);
    throw new Error("Không tìm thấy thông tin thời tiết từ OpenWeatherMap.");
  }
}

async function getWeatherFromAccuWeather(cityKey) {
  try {
    const response = await axios.get(`${ACCUWEATHER_URL}${cityKey}?apikey=${ACCUWEATHER_API_KEY}`);
    return response.data[0];
  } catch (error) {
    console.error(`Lỗi khi gọi AccuWeather API: ${error.response ? error.response.data.message : error.message}`);
    throw new Error("Không tìm thấy thông tin thời tiết từ AccuWeather.");
  }
}

async function getCityKey(cityName) {
  try {
    const response = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${ACCUWEATHER_API_KEY}&q=${encodeURIComponent(cityName)}`);
    if (response.data.length > 0) {
      return response.data[0].Key;
    } else {
      throw new Error("Không tìm thấy mã thành phố trong AccuWeather.");
    }
  } catch (error) {
    console.error(`Lỗi khi tìm mã thành phố từ AccuWeather: ${error.response ? error.response.data.message : error.message}`);
    throw new Error("Không thể tìm mã thành phố từ AccuWeather.");
  }
}

module.exports = {
  name: "weather",
  dev: "Akira, HNT",
  info: "Tra cứu thông tin thời tiết",
  onPrefix: true,
  dmUser: false,
  usages: "weather [tên thành phố]",
  cooldowns: 5,

  onLaunch: async function({ api, event, target }) {
    const cityName = target.join(" ");
    if (!cityName) {
      return api.sendMessage("🌍 Bạn chưa nhập tên thành phố/khu vực cần tra cứu thời tiết.", event.threadID);
    }

    try {
      let translatedCityName = cityName;
      if (!/^[a-zA-Z\s]+$/.test(cityName)) { 
        try {
          translatedCityName = await translate(cityName, { to: "en" });
          if (typeof translatedCityName === 'object' && translatedCityName.text) {
            translatedCityName = translatedCityName.text;
          }
        } catch (error) {
          return api.sendMessage("Có lỗi xảy ra khi dịch tên thành phố. Vui lòng kiểm tra lại.", event.threadID);
        }
      }

      let weatherData;
      try {
        weatherData = await getWeatherFromOpenWeather(translatedCityName);
      } catch (error) {
        console.warn("Không tìm thấy thành phố từ OpenWeatherMap, đang thử AccuWeather...");

        let cityKey;
        try {
          cityKey = await getCityKey(translatedCityName);
          weatherData = await getWeatherFromAccuWeather(cityKey);
        } catch (accuWeatherError) {
          console.error("Không tìm thấy thành phố từ AccuWeather:", accuWeatherError);
          throw new Error("Không thể lấy dữ liệu thời tiết từ cả OpenWeatherMap và AccuWeather.");
        }
      }

      if (!weatherData || (!weatherData.weather && !weatherData.main)) {
        return api.sendMessage("❗ Không thể lấy dữ liệu thời tiết. Vui lòng thử lại sau.", event.threadID);
      }

      const weatherDescription = `
        Thời tiết tại ${weatherData.name} hiện tại:
        - Mô tả: ${weatherData.weather[0]?.description || "Không có mô tả"}
        - Nhiệt độ: ${weatherData.main?.temp || "Không có thông tin"}°C
        - Độ ẩm: ${weatherData.main?.humidity || "Không có thông tin"}%
        - Tốc độ gió: ${weatherData.wind?.speed || "Không có thông tin"} m/s
      `;

      api.sendMessage(weatherDescription, event.threadID);
    } catch (error) {
      api.sendMessage("⚠️ Có lỗi xảy ra khi lấy thông tin thời tiết. Vui lòng thử lại sau.", event.threadID);
    }
  },

  onLoad: function({ api }) {
    const now = new Date();
    const vietnamTimezoneOffset = 7 * 60 * 60 * 1000;
    const localTime = new Date(now.getTime() + vietnamTimezoneOffset);
    
    const minutesUntilNextHour = 60 - localTime.getMinutes();
    const msUntilNextHour = (minutesUntilNextHour * 360 + (360 - localTime.getSeconds())) * 1000; 

    console.log(`Đang chờ ${msUntilNextHour} ms để thông báo vào giờ tiếp theo.`);

    setTimeout(() => {
        console.log('Gửi thông báo thời tiết đầu tiên.');
        notifyWeather(api); 
        setInterval(() => {
            console.log('Gửi thông báo thời tiết mỗi giờ.');
            notifyWeather(api); 
        }, 360 * 60 * 1000);
    }, msUntilNextHour);
  }
};
