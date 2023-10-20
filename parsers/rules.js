const fs = require('fs');
const path = require('path');

module.exports.parse = (raw, { yaml }) => {
  const rawObj = yaml.parse(raw);

  rawObj['rule-providers'] = {};
  rawObj.rules = [];

  // 1. 从外部的自定义规则文件中读取规则
  const customRulePath = path.join(__dirname, 'config/custom-rule.txt'); 
  const customRules = fs.readFileSync(customRulePath, 'utf-8').split('\n').filter(line => line.trim() !== '');

  // 将自定义规则添加到rules数组
  rawObj.rules.push(...customRules);

  // 2. 2. 从外部的yaml文件中读取规则集
  const ruleYAMLPath = path.join(__dirname, 'config/rule-set.yaml'); 
  const ruleYAML = fs.readFileSync(ruleYAMLPath, 'utf-8');
  const ruleObj = yaml.parse(ruleYAML);

  for (let key in ruleObj) {
    const rule = ruleObj[key];
    // 生成规则并添加到 rules
    rawObj.rules.push(`RULE-SET,${key},${rule.group}`);

    // 生成 rule-providers 并且添加到原始对象中
    rawObj['rule-providers'][key] = {
      type: 'http',
      behavior: rule.behavior,
      url: rule.url,
      path: rule.path,
      interval: 21600
    };
  }
  rawObj.rules.push('GEOIP,CN,DIRECT');
  rawObj.rules.push('MATCH,Final');

  return yaml.stringify(rawObj);
}


