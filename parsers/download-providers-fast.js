module.exports.parse = async (raw, { axios, yaml, console, homeDir }) => {
    const fs = require('fs');
    const path = require('path');

    const rawObj = yaml.parse(raw);
    const providers = rawObj['rule-providers'];
    for (let provider in providers) {
        const obj = providers[provider];
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
    return yaml.stringify(rawObj);
};
