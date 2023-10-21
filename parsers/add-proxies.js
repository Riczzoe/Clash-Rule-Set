delete require.cache[require.resolve('./assignProxyGroup')];
const { assignProxyGroups } = require('./assignProxyGroup');
const fs = require('fs');
const path = require('path');

module.exports.parse = (raw, { yaml}) => {
    const rawObj = yaml.parse(raw);
    const combineAndDeduplicate = (...arrays) => {
        return [...new Set(arrays.flat())];
    }
    const constructGroup = (specificNames, defaultNames) => {
        return combineAndDeduplicate(specificNames.filter(name => baseProxy.includes(name)), defaultNames);
    };

    const defaultGroup = ["PROXY", "Reject", "Final"];
    const configFile = path.join(__dirname, 'config/config.json');
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const baseGroup = config.proxyGroups;

    const baseProxy = rawObj['proxy-groups']
        .filter(group => group.type === 'select') // 检查 type 属性
        .map(group => group.name)
        // 排除 baseGroup 中的项
        .filter(name => !baseGroup.includes(name))
        // 排除 defaultGroup 中的项
        .filter(name => !defaultGroup.includes(name));
    const MustProxy = ["PROXY", ...baseProxy];
    const DirectFirst = ["DIRECT", ...MustProxy];
    const ProxyFirst = ["PROXY", "DIRECT", ...baseProxy];
    const AI = constructGroup(["US", "UK"], MustProxy);
    const HamiVideo = constructGroup(["TW"], MustProxy);
    const StarPlusLogin = constructGroup(["America"], MustProxy);
    const StarPlus = constructGroup(["US"], MustProxy);

    const updatedRawObj = assignProxyGroups(rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, HamiVideo, StarPlusLogin, StarPlus });
    return yaml.stringify(updatedRawObj);
};

