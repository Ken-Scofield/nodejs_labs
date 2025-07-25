const express = require('express');
const router = express.Router();

/**
 * 公共信息接口 - 展示客户端信息
 */
router.get('/', (req, res) => {
  res.json({
    message: '公共资源',
    timestamp: new Date().toISOString(),
    client: {
      ip: req.clientInfo?.ip || '未知',
      location: req.clientInfo?.location || '未知',
      userAgent: req.headers['user-agent'] || '未检测'
    }
  });
});

module.exports = router;
