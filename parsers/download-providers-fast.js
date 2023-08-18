module.exports.parse = async (raw, { axios, yaml, console, homeDir }) => {
    const fs = require('fs');
    const path = require('path');

    const rawObj = yaml.parse(raw);
    const ruleProviders = rawObj['rule-providers'];
    for (let provider in ruleProviders) {
        const obj = ruleProviders[provider];
        if (obj.type === 'file') {
            continue;
        }
        const ret = await axios({
            method: 'get',
            url: obj.url,
        });

        const configPath = obj.path.replace('./', '');
        const filePath = homeDir + '/provider/' + configPath;  
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, ret.data);
        obj.type = 'file';
        obj.path = filePath;
        delete obj.url;
    }

    const proxyProviders = rawObj['proxy-providers'];
    const downloadedUrls = new Set(); // 用于跟踪已下载的URLs
    let responseData = null;

    if (proxyProviders) {
        for (let provider in proxyProviders) {
            const obj = proxyProviders[provider];

            if (obj.type === 'file') {
                continue;
            }

            // 如果URL尚未被下载，那么下载它
            if (!downloadedUrls.has(obj.url)) {
                const ret = await axios({
                    method: 'get',
                    url: obj.url,
                });
                responseData = ret.data;
                downloadedUrls.add(obj.url); // 将URL添加到已下载集合中
            }

            const configPath = obj.path.replace('./', '');
            const filePath = homeDir + 'provider' + configPath;
            const dir = path.dirname(filePath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            let shouldWrite = true; // 默认值是true

            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const fileCreationTime = stats.birthtime;
                const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

                // 如果文件创建时间距离现在不超过6小时，则不需要写入
                if ((Date.now() - fileCreationTime.getTime()) < sixHours) {
                    shouldWrite = false;
                }
            }

            if (shouldWrite) {
                fs.writeFileSync(filePath, responseData);
            }

            obj.type = 'file';
            obj.path = filePath;
            delete obj.url;
        }
    }
    return yaml.stringify(rawObj);
};
