const { getClientLocation } = require('../services/ipService');

/**
 * IP追踪中间件
 * 获取客户端IP和地理位置信息
 */
const ipTrackerMiddleware = async (req, res, next) => {
  try {
    // 获取客户端真实IP（考虑多层代理）
    const getClientIp = (req) => {
      // 可能的代理头列表（按优先级从低到高）
      const headerNames = [
        'x-client-ip',
        'cf-connecting-ip', // Cloudflare
        'x-forwarded-for',
        'x-real-ip',
        'x-forwarded',
        'forwarded-for',
        'true-client-ip'
      ];

      // 按优先级从高到低检查
      for (let i = headerNames.length - 1; i >= 0; i--) {
        const header = headerNames[i];
        const value = req.headers[header];

        if (value) {
          const ips = value.split(',');
          const clientIp = ips[0].trim();
          if (clientIp) return clientIp;
        }
      }

      // 默认返回直接连接地址
      return req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress;
    };

    // 处理IPv6格式（包括IPv4映射的IPv6地址）
    const normalizeIp = (ip) => {
      if (!ip) return null;

      // 移除IPv6前缀
      if (ip.startsWith('::ffff:')) {
        return ip.replace('::ffff:', '');
      }

      // 简化IPv6表示
      if (ip.startsWith('::1')) return '127.0.0.1';

      return ip;
    };

    const clientIp = normalizeIp(getClientIp(req));

    // 将IP信息附加到请求对象
    req.clientInfo = {
      ip: clientIp || '0.0.0.0',
      location: '未知'
    };

    // 尝试获取地理位置信息
    if (clientIp && clientIp !== '127.0.0.1' && !clientIp.startsWith('192.168.')) {
      try {
        req.clientInfo.location = await getClientLocation(clientIp);
      } catch (err) {
        console.warn(`无法获取位置信息: ${err.message}`);
        req.clientInfo.location = '获取失败';
      }
    }

    next();
  } catch (err) {
    console.error('IP追踪错误:', err.message);
    req.clientInfo = req.clientInfo || {};
    req.clientInfo.error = '地理位置服务异常';
    next();
  }
};

module.exports = ipTrackerMiddleware;
