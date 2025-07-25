const express = require('express');
const router = express.Router();

/**
 * 获取用户信息接口
 */
router.get('/', (req, res) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({
      error: '未授权的请求',
      required: 'Bearer令牌'
    });
  }

  res.json({
    userId: req.user.id,
    name: '示例用户',
    email: 'user@example.com',
    role: req.user.role,
    accessTime: new Date().toISOString()
  });
});

module.exports = router;
