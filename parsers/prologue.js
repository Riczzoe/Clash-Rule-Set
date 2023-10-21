const fs = require('fs');
const path = require('path');

module.exports.parse = (raw, { yaml }) => {
  // 从原始数据中解析出对象
  const rawObj = yaml.parse(raw);

  // 删除原始的proxy-groups和rules
  rawObj['proxy-groups'] = [];
  rawObj.rules = [];

  const configFile = path.join(__dirname, 'config/config.json');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const groupNames = config.proxyGroups;

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

