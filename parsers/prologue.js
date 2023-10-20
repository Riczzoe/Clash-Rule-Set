const fs = require('fs');
const path = require('path');

module.exports.parse = (raw, { yaml }) => {
  // 从原始数据中解析出对象
  const rawObj = yaml.parse(raw);

  // 删除原始的proxy-groups和rules
  rawObj['proxy-groups'] = [];
  rawObj.rules = [];

  // 读取proxy-groups-config.txt中的策略组名称
  const proxyGroupsConfigPath = path.join(__dirname, 'config/proxy-groups-config.txt');
  const groupNames = fs.readFileSync(proxyGroupsConfigPath, 'utf-8').split('\n').filter(name => name.trim() !== '');

  // 默认的PROXY策略组
  const defaultProxyGroup = {
    name: 'PROXY',
    type: 'select',
    proxies: []
  };

  // 为每个策略组名称生成完整的配置
  const proxyGroups = groupNames.map(name => {
    return {
      name: name,
      type: 'select',
      proxies: []
    };
  });

  // 先添加默认的PROXY策略组
  proxyGroups.unshift(defaultProxyGroup);

  // 添加默认的Reject和Final策略组
  proxyGroups.push(
    {
      name: 'Reject',
      type: 'select',
      proxies: ['REJECT', 'PROXY']
    },
    {
      name: 'Final',
      type: 'select',
      proxies: ['PROXY', 'DIRECT']
    }
  );

  // 将新的策略组添加到原始对象中
  rawObj['proxy-groups'] = proxyGroups;

  // 返回修改后的YAML字符串
  return yaml.stringify(rawObj);
};

