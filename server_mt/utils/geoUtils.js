const geoip = require('geoip-lite');
const { LRUCache } = require('lru-cache');
const axios = require('axios');

// 创建本地缓存
const cache = new LRUCache({
  max: 1000,        // 最大缓存条目
  maxAge: 1000 * 60 * 60 * 24 // 缓存一天
});

/**
 * 获取IP地理位置信息
 * @param {string} ip - IP地址
 * @returns {Promise<string>} 地理位置描述
 */
const getIpLocation = async (ip) => {
  // 检查本地缓存
  if (cache.has(ip)) {
    return cache.get(ip);
  }

  // 尝试使用离线GeoIP数据库
  try {
    const geo = geoip.lookup(ip);
    if (geo) {
      const location = `${geo.country} ${geo.region} ${geo.city}`;
      cache.set(ip, location);
      return location;
    }
  } catch (e) {
    console.log('本地GeoIP查询失败，使用在线服务');
  }

  // 使用在线服务获取更精确的位置
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      params: {
        fields: 'status,country,regionName,city,isp', lang: 'zh-CN'
      }, timeout: 2000
    });

    if (response.data && response.data.status === 'success') {
      const { country, regionName, city, isp } = response.data;
      const location = `${country || ''} ${regionName || ''} ${city || ''} ${isp ? `(${isp})` : ''}`.trim();
      cache.set(ip, location);
      return location;
    }
  } catch (error) {
    console.error('在线IP服务错误:', error.message);
    throw new Error('地理位置服务不可用');
  }

  return '未知位置';
};

module.exports = {
  getIpLocation
};
