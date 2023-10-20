module.exports.parse = (raw, { yaml }) => {
    // 从原始数据中解析出对象
    const rawObj = yaml.parse(raw);

    // 定义所有可能的地区和它们的匹配规则
    const regions = {
        'HK': /^(.*)(香港|Hong Kong|HK|澳门)+(.*)$/,
        'TW': /^(.*)(台湾|TW|TaiWan|Taiwan)+(.*)$/,
        'SG': /^(.*)(新加坡|SG|Singapore|狮城)+(.*)$/,
        'KR': /^(.*)(韩国|KR|Korea)+(.*)$/,
        'JP': /^(.*)(日本|JP|Japan)+(.*)$/,
        'US': /^(.*)(美国|US|USA)+(.*)$/,
        'UK': /^(.*)(英国|UK|)+(.*)$    /,
        'Asia': /^(.*)(马来西亚|马尔代夫|柬埔寨|泰国|缅甸|老挝|越南|不丹|文莱|朝鲜|菲律宾|印尼|Indonsia|印度|India|蒙古|约旦|伊朗|巴林|阿曼|以色列|土耳其|尼泊尔|东帝汶|孟加拉|黎巴嫩|伊拉克|叙利亚|阿富汗|卡塔尔|阿联酋|阿塞拜疆|亚美尼亚|格鲁吉亚|巴基斯坦|斯里兰卡|沙特阿拉伯|哈萨克斯坦|吉尔吉斯斯坦|乌兹别克斯坦)+(.*)/,
        'Oceania': /^(.*)(澳大利亚|Australia|新西兰|关岛|斐济|南极)+(.*)/,
        'America': /^(.*)(加拿大|Canada|墨西哥|巴拿马|百慕大|格陵兰|哥斯达黎加|英属维尔京|巴西|Brazil|智利|Chile|秘鲁|古巴|阿根廷|Argentina|乌拉圭|牙买加|苏里南|荷属库拉索|哥伦比亚|厄瓜多尔|委内瑞拉|危地马拉|波多黎各|开曼群岛)+(.*)/,
        'Europe': /^(.*)(Netherlands|荷兰|Russia|俄罗斯|Germany|德国|France|法国|Switzerland|瑞士|Sweden|瑞典|Bulgaria|保加利亚|Austria|奥地利|Ireland|爱尔兰|Turkey|Hungary|法国|英国|马恩岛|德国|丹麦|挪威|瑞典|芬兰|冰岛|瑞士|捷克|希腊|荷兰|波兰|黑山|俄罗斯|乌克兰|匈牙利|卢森堡|奥地利|意大利|梵蒂冈|比利时|爱尔兰|立陶宛|西班牙|葡萄牙|安道尔|马耳他|摩纳哥|保加利亚|克罗地亚|北马其顿|塞尔维亚|塞浦路斯|拉脱维亚|摩尔多瓦|斯洛伐克|爱沙尼亚|白俄罗斯|罗马尼亚|直布罗陀|圣马力诺|法罗群岛|奥兰群岛|斯洛文尼亚|阿尔巴尼亚|波黑共和国|列支敦士登)+(.*)/,
        'Africa': /^(.*)(法属留尼汪|埃及|加纳|南非|摩洛哥|突尼斯|肯尼亚|卢旺达|佛得角|安哥拉|尼日利亚|毛里求斯)+(.*)/,
    };

    // 根据regions生成策略组结构
    const proxyGroups = Object.keys(regions).map(region => {
        const existingGroup = rawObj['proxy-groups'] && rawObj['proxy-groups'].find(g => g.name === region);
        if (existingGroup) {
            return existingGroup;
        }
        return {
            name: region,
            type: 'select',
            proxies: []
        };
    });
    
    // 遍历所有的代理节点，并根据其名称归类到对应的策略组中
    if (rawObj.proxies) {
        rawObj.proxies.forEach(proxy => {
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
    
    // 把原始的proxy-groups策略组和新的策略组合并
    rawObj['proxy-groups'] = [
        ...rawObj['proxy-groups'], 
        ...proxyGroups.filter(group => 
            (group.proxies && group.proxies.length > 0) || 
            (group.use && group.use.length > 0)
        ).filter(group => !rawObj['proxy-groups'].some(existingGroup => existingGroup.name === group.name))
     ];

    return yaml.stringify(rawObj);
};
