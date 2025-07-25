const { getIpLocation } = require('../utils/geoUtils');

// IP服务
const ipService = {
  /**
   * 获取客户端地理位置
   * @param {string} ip - IP地址
   * @returns {Promise<string>} 地理位置描述
   */
  getClientLocation: async (ip) => {
    try {
      // 私有IP范围处理
      const privateRanges = [
        '10.', '192.168.', '172.16.', '172.17.', '172.18.',
        '172.19.', '172.20.', '172.21.', '172.22.',
        '172.23.', '172.24.', '172.25.', '172.26.',
        '172.27.', '172.28.', '172.29.', '172.30.', '172.31.'
      ];

      if (privateRanges.some(range => ip.startsWith(range)) ||
        ip === '127.0.0.1' ||
        ip.startsWith('::1')) {
        return '本地网络';
      }

      return await getIpLocation(ip);
    } catch (error) {
      console.error('获取位置失败:', error.message);
      return '位置服务错误';
    }
  }
};

module.exports = ipService;
