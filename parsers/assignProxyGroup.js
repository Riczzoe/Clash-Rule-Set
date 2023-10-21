const fs = require('fs');
const path = require('path');

module.exports.assignProxyGroups = (rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, HamiVideo, StarPlusLogin, StarPlus }) => {
    const MustProxyGroup = ["Amusement", "GAM"];
    const DirectFirstGroup = ["China", ];
    const ProxyFirstGroup = ["Download", "GAM", "Scholar", "Tech"];

    const configFile = path.join(__dirname, 'config/config.json');
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const baseGroup = config.proxyGroups;

    const { 'proxy-groups': proxy = [] } = rawObj;
    proxy.forEach(group => {
        if (MustProxyGroup.includes(group.name)) {
            group.proxies = MustProxy;
        } else if (DirectFirstGroup.includes(group.name)) {
            group.proxies = DirectFirst;
        } else if (ProxyFirstGroup.includes(group.name)) {
            group.proxies = ProxyFirst;
        } else if (group.name === "PROXY") {
            group.proxies = baseProxy;
        } else if (group.name === "AI") {
            group.proxies = AI;
        } else if (group.name === "HamiVideo") {
            group.proxies = HamiVideo;
        } else if (group.name === "StarPlusLogin") {
            group.proxies = StarPlusLogin;
        } else if (group.name === "StarPlus") {
            group.proxies = StarPlus;
        } else if (baseGroup.includes(group.name)) {
            group.proxies = ProxyFirst;
        }
    });

    rawObj['proxy-groups'] = proxy;
    return rawObj;
};
