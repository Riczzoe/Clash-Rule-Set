// delete require.cache[require.resolve('./assignProxyGroup')];
const { assignProxyGroups } = require('./assignProxyGroup');

module.exports.parse = (raw, { yaml}) => {
    const rawObj = yaml.parse(raw);
    const combineAndDeduplicate = (...arrays) => {
        return [...new Set(arrays.flat())];
    }
    const constructGroup = (specificNames, defaultNames) => {
        return combineAndDeduplicate(specificNames.filter(name => baseProxy.includes(name)), defaultNames);
    };

    const regions = ["HK", "TW", "SG", "KR", "JP", "US", "UK", "Asia", "Oceania", "America", "Europe", "Africa", "Daily", "Streaming"];

    // 从 yaml 中动态获取策略组名，但只包含 regions 中的名字
    const baseProxy = rawObj['proxy-groups'].map(group => group.name).filter(name => regions.includes(name));
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

