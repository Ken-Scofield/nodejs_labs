/**
 * 认证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const authMiddleware = (req, res, next) => {
  const authToken = req.headers.authorization || '';
  
  // 模拟验证逻辑
  const isAuthenticated = authToken.startsWith('Bearer valid_token_');
  req.isAuthenticated = isAuthenticated;
  
  // 附加权限信息
  if (isAuthenticated) {
    req.user = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      role: authToken.includes('admin') ? 'admin' : 'user'
    };
  }
  
  next();
};

module.exports = authMiddleware;