const fs = require('fs');
const path = require('path');

module.exports.assignProxyGroups = (rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, HamiVideo, StarPlusLogin, StarPlus }) => {
    const MustProxyGroup = ["Amazon", "Disney", "Emby", "Google", 
                            "HBOMAX", "Netflix", "Spotify", "Steam", 
                            "Speedtest", "Twitter", "Telegram", "YouTube"
                            ];
    const DirectFirstGroup = ["Apple", "Bilibili", "China", "Coursera"];
    const ProxyFirstGroup = ["Microsoft", "PayPal", "Scholar", "Tiktok"];

    const proxyGroupsConfigPath = path.join(__dirname, 'config/proxy-groups-config.txt');
    const baseGroup = fs.readFileSync(proxyGroupsConfigPath, 'utf-8').split('\n').filter(name => name.trim() !== '');

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
