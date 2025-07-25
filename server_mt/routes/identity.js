const express = require('express');
const router = express.Router();
const deviceService = require('../services/deviceService');

/**
 * 身份信息端点
 */
router.get('/', (req, res) => {
  if (!req.clientIdentity) {
    return res.status(400).json({ error: '客户端身份未识别' });
  }

  // 确保使用正确的服务方法
  const creationDate = deviceService.getCreationDate(req.clientIdentity.id);

  // 格式化响应
  const response = {
    identity: {
      id: req.clientIdentity.id,
      type: req.clientIdentity.macAddress ? '设备' : '浏览器',
      created: creationDate ? creationDate.toISOString() : '未知'
    },
    device: {
      fingerprint: req.clientIdentity.fingerprint,
      macAddress: req.clientIdentity.macAddress || '不可用'
    },
    network: {
      ip: req.clientInfo?.ip || '未知',
      location: req.clientInfo?.location || '未知'
    }
  };

  res.json(response);
});

/**
 * 客户端MAC地址提交
 */
router.post('/mac', express.json(), (req, res) => {
  // 验证客户端可信状态
  if (!deviceService.isTrustedEnvironment(req)) {
    return res.status(403).json({ error: '请求被拒绝' });
  }

  // 验证数据格式
  const { localIPs, macAddress } = req.body;
  if (!localIPs || !Array.isArray(localIPs)) {
    return res.status(400).json({ error: '无效数据格式' });
  }

  // 处理MAC地址
  if (macAddress && deviceService.validateMacFormat(macAddress)) {
    // 关联客户端ID与MAC地址
    deviceService.associateMacWithClient(
      req.clientId,
      macAddress,
      req.clientInfo?.ip
    );
    console.log(`客户端 ${req.clientId} 报告MAC地址: ${macAddress}`);
  }

  // 处理IP地址
  deviceService.recordLocalIps(req.clientId, localIPs);

  res.status(200).json({ status: '已接收MAC信息' });
});

module.exports = router;
