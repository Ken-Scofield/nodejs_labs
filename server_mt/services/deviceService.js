const { LRUCache } = require('lru-cache');
const { v4: uuidv4 } = require('uuid');
const { generateDeviceFingerprint, isTrustedEnvironment } = require('../utils/clientFingerprint');

// 客户端信息存储
const clientStore = new Map(); // 实际项目中应使用数据库
const macLookup = new LRUCache({ max: 1000, maxAge: 1000 * 60 * 60 * 24 * 7 }); // 1周缓存

// 创建日期缓存（存储格式：Map<clientId, timestamp>）
const creationDates = new Map();

module.exports = {
  /**
   * 获取或创建客户端唯一ID
   */
  getClientIdentifier (req, res) {
    // 检查Cookie中是否已有ID
    let clientId = req.cookies?.client_id;
    let isNewClient = false;

    if (!clientId || !this.validateClientId(clientId)) {
      // 生成新的唯一ID
      clientId = uuidv4();
      isNewClient = true;

      // 记录创建时间
      creationDates.set(clientId, Date.now());

      // 设置HTTP-only Cookie (1年有效期)
      res.cookie('client_id', clientId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      });

      // 记录新客户端生成
      console.log(`新客户端标识: ${clientId}, IP: ${req.clientInfo?.ip}`);
    }

    return clientId;
  },

  /**
   * 获取客户端创建日期
   */
  getCreationDate (clientId) {
    if (!clientId) return null;

    // 尝试获取缓存时间
    const timestamp = creationDates.get(clientId);
    if (timestamp) {
      return new Date(timestamp);
    }

    // 模拟数据库查询
    return new Date(); // 实际项目中应查询数据库
  },

  /**
   * 验证ID格式
   */
  validateClientId (id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  },

  /**
   * 尝试获取MAC地址
   * 仅在可信环境中有效
   */
  getMacAddress (req) {
    // 1. 优先检查头信息
    if (req.headers['x-client-mac']) {
      const mac = req.headers['x-client-mac'];
      if (this.validateMacFormat(mac)) return mac;
    }

    // 2. 可信环境获取真实MAC
    if (isTrustedEnvironment(req)) {
      // 本地ARP缓存查询（仅企业内网有效）
      const ip = req.clientInfo?.ip;
      if (ip && macLookup.has(ip)) return macLookup.get(ip);

      // 实际生产环境可以:
      // a) 调用本地系统命令 (需在服务器端实现)
      // b) 与企业网络服务API集成
      // c) 移动端SDK获取

      // 此处仅返回模拟值
      return '00:1A:7D:DA:71:13';
    }

    return null;
  },

  /**
   * MAC地址格式验证
   */
  validateMacFormat (mac) {
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
  },

  /**
   * 生成唯一性标识组合
   */
  generateUniqueIdentifier (req) {
    const components = {
      fingerprint: generateDeviceFingerprint(req),
      clientId: req.clientId,
      macAddress: this.getMacAddress(req),
      ip: req.clientInfo?.ip,
      timestamp: Date.now()
    };

    return JSON.stringify(components);
  },

  /**
   * 关联MAC地址与客户端
   */
  associateMacWithClient (clientId, macAddress, ip) {
    if (!this.validateMacFormat(macAddress)) return false;

    // 实际项目中应存储到数据库
    if (ip) {
      macLookup.set(ip, macAddress);
    }

    // 添加到客户端信息存储
    let clientInfo = clientStore.get(clientId) || {};
    clientInfo.macAddress = macAddress;
    clientStore.set(clientId, clientInfo);

    return true;
  },

  /**
   * 记录本地IP地址
   */
  recordLocalIps (clientId, ips) {
    // 实际项目中应存储到数据库
    let clientInfo = clientStore.get(clientId) || {};
    clientInfo.localIPs = ips;
    clientStore.set(clientId, clientInfo);
  },

  /**
   * 判断是否是可信环境
   */
  isTrustedEnvironment (req) {
    return isTrustedEnvironment(req);
  },

  /**
   * 获取客户端信息的私有方法（仅用于调试）
   */
  _getClientStore () {
    return clientStore;
  }
};
