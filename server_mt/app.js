const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');
const requestLogger = require('./middleware/logger');
const ipTrackerMiddleware = require('./middleware/ipTracker');
const clientIdentifier = require('./middleware/clientIdentifier');

const userRoutes = require('./routes/user');
const publicRoutes = require('./routes/public');
const analyticsRoutes = require('./routes/analytics');
const identityRoutes = require('./routes/identity');
const logRoutes = require('./routes/logs');

// 创建应用实例
const app = express();

// 信任代理以获取真实IP（如果使用）
app.set('trust proxy', true);

// 全局中间件
app.use(bodyParser.json());
app.use(cookieParser());
app.use(ipTrackerMiddleware); // 在日志中间件之前添加IP追踪
app.use(clientIdentifier);
app.use(requestLogger); // 请求日志

// API路由
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/logs', authMiddleware, logRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '端点未找到',
    requested: req.originalUrl
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    error: '内部服务器错误',
    message: '请检查服务器日志'
  });
});

module.exports = app;
