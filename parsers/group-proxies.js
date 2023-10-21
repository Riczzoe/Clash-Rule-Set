const fs = require('fs');
const path = require('path');

module.exports.parse = (raw, { yaml }) => {
    // 从原始数据中解析出对象
    const rawObj = yaml.parse(raw);

    const configFile = path.join(__dirname, 'config/config.json');
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    // 根据加载的规则创建正则表达式对象
    const regions = config.customGroups.reduce((acc, group) => {
        // 从字符串格式的正则表达式中创建RegExp对象
        acc[group.name] = new RegExp(group.pattern.slice(1, -1));
        return acc;
    }, {});


    const proxyGroups = Object.keys(regions).map(region => {
        const existingGroup = rawObj['proxy-groups'] && rawObj['proxy-groups'].find(g => g.name === region);
        if (existingGroup) {
            if (!existingGroup.proxies) {
                existingGroup.proxies = [];
            }
            return existingGroup;
        }
        return {
            name: region,
            type: 'select',
            proxies: []
        };
    });

    if (rawObj.proxies) {
        rawObj.proxies.forEach(proxy => {
            if (proxy.name.includes('[Premium]')) {
                return;
            }

            for (const [region, regex] of Object.entries(regions)) {
                if (regex.test(proxy.name)) {
                    const group = proxyGroups.find(g => g.name === region);
                    if (group) {
                        group.proxies.push(proxy.name);
                    }
                }
            }
        });
    }

    rawObj['proxy-groups'] = [
        ...rawObj['proxy-groups'], 
        ...proxyGroups.filter(group => 
            (group.proxies && group.proxies.length > 0) || 
            (group.use && group.use.length > 0)
        ).filter(group => !rawObj['proxy-groups'].some(existingGroup => existingGroup.name === group.name))
     ];

    return yaml.stringify(rawObj);
};
