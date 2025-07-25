const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * 获取日志数据
 */
const getLogData = async (page = 1, pageSize = 50, filter = '') => {
  const logFile = path.join(__dirname, '../logs/requests.log');

  if (!fs.existsSync(logFile)) {
    return { error: '日志文件不存在', logs: [] };
  }

  try {
    // 读取日志内容
    let logs = fs.readFileSync(logFile, 'utf-8')
      .split('\n')
      .filter(line => line.trim() !== '')
      .reverse(); // 最新的日志在顶部

    // 应用过滤器
    if (filter) {
      const filterRegex = new RegExp(filter, 'i');
      logs = logs.filter(log => filterRegex.test(log));
    }

    // 分页处理
    const totalLogs = logs.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    return {
      page,
      pageSize,
      totalPages: Math.ceil(totalLogs / pageSize),
      totalLogs,
      logs: paginatedLogs
    };
  } catch (error) {
    console.error('读取日志失败:', error);
    return { error: '无法读取日志文件', logs: [] };
  }
};

/**
 * 下载日志文件
 */
router.get('/download', (req, res) => {
  const logFile = path.join(__dirname, '../logs/requests.log');

  if (!fs.existsSync(logFile)) {
    return res.status(404).json({ error: '日志文件不存在' });
  }

  try {
    const date = new Date();
    const filename = `server-logs-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // 提供下载
    const fileStream = fs.createReadStream(logFile);
    fileStream.pipe(res);
  } catch (error) {
    console.error('下载日志失败:', error);
    res.status(500).json({ error: '服务器处理失败' });
  }
});

/**
 * 压缩并下载日志
 */
router.get('/download/zip', (req, res) => {
  const logFile = path.join(__dirname, '../logs/requests.log');

  if (!fs.existsSync(logFile)) {
    return res.status(404).json({ error: '日志文件不存在' });
  }

  try {
    const date = new Date();
    const filename = `server-logs-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // 创建压缩流
    const gzip = zlib.createGzip();
    const fileStream = fs.createReadStream(logFile);

    // 管道流处理
    fileStream.pipe(gzip).pipe(res);
  } catch (error) {
    console.error('压缩日志失败:', error);
    res.status(500).json({ error: '服务器处理失败' });
  }
});

/**
 * 查看日志接口
 */
router.get('/', async (req, res) => {
  // 查询参数
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 100);
  const filter = req.query.filter || '';

  // 仅管理员可访问
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: '拒绝访问',
      message: '需要管理员权限查看日志'
    });
  }

  // 获取日志数据
  const logData = await getLogData(page, pageSize, filter);

  res.json({
    success: true,
    ...logData
  });
});

module.exports = router;
