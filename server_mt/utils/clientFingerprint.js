const crypto = require('crypto');

/**
 * 生成设备指纹
 * @param {Object} req - Express请求对象
 * @returns {string} 设备指纹哈希
 */
const generateDeviceFingerprint = (req) => {
  try {
    const components = {
      userAgent: req.headers['user-agent'] || 'unknown',
      platform: req.headers['sec-ch-ua-platform'] || 'unknown',
      ip: req.clientInfo?.ip || '0.0.0.0',
      timezone: req.headers['x-client-timezone'] || 'UTC',
      languages: req.headers['accept-language'] || 'en',
      screen: req.headers['x-client-screen'] || 'unknown',
      clientId: req.cookies?.client_id || null
    };

    // 确保所有值都是字符串
    const hashInput = JSON.stringify(components);

    const hash = crypto.createHash('sha256');
    hash.update(hashInput);

    return hash.digest('hex');
  } catch (error) {
    console.error('生成设备指纹失败:', error);
    return 'fingerprint-error';
  }
};

/**
 * 检测是否可信的客户端环境
 * 用于确定是否尝试获取真实MAC地址
 */
const isTrustedEnvironment = (req) => {
  const userAgent = req.headers['user-agent'] || '';

  // 检测是否为受控环境（如企业应用或移动APP）
  return (
    userAgent.includes('CompanyApp/') ||
    req.headers['x-client-type'] === 'trusted'
  );
};

module.exports = {
  generateDeviceFingerprint,
  isTrustedEnvironment
};
