const { logRequest, formatRequestInfo } = require('../utils/requestLogger');

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  // 创建响应完成时的监听器
  res.on('finish', () => {
    // 准备日志数据
    const logData = {
      ...formatRequestInfo(req),
      status: res.statusCode,
      duration: `${Date.now() - req._startTime}ms`,
      userAgent: req.headers['user-agent'] || 'Unknown'
    };
    
    // 记录日志
    logRequest(logData);
  });
  
  // 记录请求开始时间
  req._startTime = Date.now();
  next();
};

module.exports = requestLogger;