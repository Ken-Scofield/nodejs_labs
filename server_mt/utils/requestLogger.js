const fs = require('fs');
const path = require('path');
const os = require('os');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志文件路径
const logFile = path.join(logDir, 'requests.log');

/**
 * 记录请求日志
 * @param {Object} req - 请求对象（可选）
 * @param {Object} logData - 日志数据对象
 */
const logRequest = (req, logData) => {
  // 确保有基础时间戳
  const timestamp = logData.timestamp || new Date().toISOString();

  // 提取客户端信息
  const clientIp = logData.ip ||
    (req && req.clientInfo && req.clientInfo.ip) ||
    '0.0.0.0';

  const location = logData.location ||
    (req && req.clientInfo && req.clientInfo.location) ||
    '未知';

  const userAgent = logData.userAgent ||
    (req && req.headers && req.headers['user-agent']) ||
    '未知';

  // 提取客户端身份信息（如果有）
  let clientId = '未知';
  let macAddress = 'N/A';

  if (req && req.clientIdentity) {
    clientId = req.clientIdentity.id || '未知';
    macAddress = req.clientIdentity.macAddress || 'N/A';
  }

  // 构建日志行
  const logLine = [
    `[${timestamp}]`,
    `${logData.method || 'REQUEST'} ${logData.path || 'SERVER_EVENT'}`,
    `IP: ${clientIp}`,
    `位置: ${location}`,
    `ID: ${clientId}`,
    `MAC: ${macAddress}`,
    `状态: ${logData.status || 'N/A'}`,
    `UA: ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}`,
    `耗时: ${logData.duration || '0ms'}`
  ].join(' | ') + '\n';

  try {
    // 异步写入日志文件
    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error('日志写入失败:', err);
    });

    // 控制台输出
    console.log(logLine.trim());
  } catch (error) {
    console.error('日志记录错误:', error);
  }
};

/**
 * 格式化请求信息
 * @param {Object} req - Express请求对象
 * @returns {Object} 格式化后的请求信息
 */
const formatRequestInfo = (req) => {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    headers: { ...req.headers },
    timestamp: new Date().toISOString()
  };
};

/**
 * 记录服务器事件日志
 * @param {string} event - 事件名称
 * @param {number} port - 端口号
 */
const logServerEvent = (event, port) => {
  const timestamp = new Date().toISOString();

  logRequest(null, {
    method: 'SERVER',
    path: event.toUpperCase(),
    ip: '127.0.0.1',
    location: 'localhost',
    status: 'INFO',
    timestamp,
    userAgent: `Node.js/${process.version} ${os.platform()}/${os.release()}`
  });
};

module.exports = {
  logRequest,
  formatRequestInfo,
  logServerEvent
};
