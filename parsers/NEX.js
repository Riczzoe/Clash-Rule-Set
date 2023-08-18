const { updateProxyGroups } = require('./assignProxyGroup');

module.exports.parse = (raw, { yaml, console }) => {
    const rawObj = yaml.parse(raw);
    const combineAndDeduplicate = (...arrays) => {
        return [...new Set(arrays.flat())];
    }

    const baseProxy = ["HK", "TW", "SG", "KR", "JP", "US", "UK", 
                       "Asia", "Oceania", "America", "Europe"];
    const MustProxy = ["PROXY", ...baseProxy];
    const DirectFirst = ["DIRECT", ...MustProxy];
    const ProxyFirst = ["PROXY", "DIRECT", ...baseProxy];
    const AI = combineAndDeduplicate(["US", "UK"], MustProxy);
    const HamiVideo = combineAndDeduplicate(["TW"], MustProxy);
    const StarPlusLogin = combineAndDeduplicate(["America"], MustProxy);
    const StarPlus = combineAndDeduplicate(["US"], MustProxy);

    const updatedRawObj = updateProxyGroups(rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, HamiVideo, StarPlusLogin, StarPlus });
    return yaml.stringify(updatedRawObj);
};
