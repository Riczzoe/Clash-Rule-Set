const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

module.exports.parse = async (raw, {yaml}, { name}) => {
    const configFile = path.join(__dirname, 'config/config.json');
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    if (config.backDir === undefined || config.backDir === '') {
        return raw;
    }
    const backupDir = config.backDir.replace('~', os.homedir());

    // 检查备份目录是否存在，如果不存在则创建它
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true }); 
    }

    // 1. 生成当前时间的字符串形式
    const currentDate = new Date();
    const timestamp = `${currentDate.getMonth() + 1}-${currentDate.getDate()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

    // 2. 创建文件名
    const backPath = path.join(backupDir, `${name}_${timestamp}.yaml`);
    fs.writeFileSync(backPath, raw);

    // 3. 列出与特定文件名相关的备份文件并保留最新的3个
    const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith(`${name}_`) && file.endsWith('.yaml'))  // 过滤出与特定文件名相关的备份文件
        .sort((a, b) => {
            const statsA = fs.statSync(path.join(backupDir, a));
            const statsB = fs.statSync(path.join(backupDir, b));
            return statsB.birthtimeMs - statsA.birthtimeMs;  // 根据文件的创建时间降序排序
        })
        .slice(3);

    // 删除超出3个的备份
    backupFiles.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
    });


    // 检查 name 是否在 needTransferName 列表中
    if (config.needTransferName && config.needTransferName.length > 0 &&
        config.deviceId && config.deviceId.length > 0 &&
        config.needTransferName.includes(name)) {
        // 使用 kdeconnect-cli 发送文件到指定的 deviceId
        const deviceId = config.deviceId;
        exec(`kdeconnect-cli -d ${deviceId} --share ${backPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            }
            console.log(`File sent: ${stdout}`);
        });
    }

    return raw;
};
