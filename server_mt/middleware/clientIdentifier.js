const deviceService = require('../services/deviceService');

/**
 * 客户端唯一性识别中间件
 */
const clientIdentifierMiddleware = (req, res, next) => {
  // 创建客户端属性容器
  req.clientIdentity = {};

  // 获取或创建客户端唯一ID
  req.clientIdentity.id = deviceService.getClientIdentifier(req, res);
  req.clientId = req.clientIdentity.id; // 兼容性设置

  // 尝试获取MAC地址
  req.clientIdentity.macAddress = deviceService.getMacAddress(req);

  // 生成设备指纹
  req.clientIdentity.fingerprint = deviceService.generateUniqueIdentifier(req);

  // 附加到日志信息
  if (!req.clientInfo) req.clientInfo = {};
  req.clientInfo.clientIdentity = req.clientIdentity;

  next();
};

module.exports = clientIdentifierMiddleware;
