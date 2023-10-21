// delete require.cache[require.resolve('./assignProxyGroup')];
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

    const defaultGroup = ["PROXY", "Final", "Reject"];
    const proxyGroupsConfigPath = path.join(__dirname, 'config/proxy-groups-config.txt');
    const baseGroup = fs.readFileSync(proxyGroupsConfigPath, 'utf-8').split('\n').filter(name => name.trim() !== '');
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

