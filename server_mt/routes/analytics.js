const express = require('express');
const router = express.Router();

/**
 * 数据分析接口
 */
router.post('/', (req, res) => {
  if (!req.isAuthenticated || req.user.role !== 'admin') {
    return res.status(403).json({
      error: '禁止访问',
      message: '需要管理员权限'
    });
  }
  
  // 简单数据处理
  const requestData = req.body;
  const dataStats = {
    dataPoints: Object.keys(requestData).length,
    size: JSON.stringify(requestData).length
  };
  
  res.json({
    status: '处理成功',
    processedAt: new Date().toISOString(),
    ...dataStats,
    authLevel: req.user.role,
    sampleData: requestData.data ? requestData.data.slice(0, 3) : []
  });
});

module.exports = router;