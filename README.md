## 简介

这个项目是我个人使用 clash 的 parser 功能来帮助我自定义我的订阅文件的配置, 以及我正在使用的规则集. 其中规则集中的数据大部分来自于项目[@dler-io/Rules](https://github.com/dler-io/Rules). 有关 parser 的介绍请看[官方文档](https://docs.cfw.lbyczf.com/contents/parser.html#%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82). 订阅链接经过 parser 处理后的结果可以参考 [parser_res.yaml](./parser_res.yaml).

## 如何使用

首先将我的 [parsers配置](./parsers/parsers.yaml) 复制到你的 clash 的 Parsers. 然后根据你的需求做自定义的修改.
根据你自己的情况修改文件路径. reg 的部分根据你的订阅链接做相应的修改. 你可以修改成下面的样子. 

```yaml
parsers:
  # Prologue
  # Remove default configuration for all subscription link
  - reg: ^.*$
    file: "yourFilePathparsers/delete-default-config.js"
  # Add custom proxy-groups
  - reg: ^.*$
    file: "yourFilePath/parsers/default-proxy-groups.yaml"

  # 如果你没有 proxy-providers 的需求, 这一步可以去除
  # Add proxy-providers
  - reg: nunhcf
    file: "yourFilePath/parsers/proxy-providers/mix-proxy-providers-TAG.yaml"

  # Group proxy by region
  - reg: nunhcf
    file: "yourFilePath/parsers/NEX.yaml"
  - reg: tag
    file: "yourFilePath/parsers/TAG.yaml"
  - reg: dogapi
    file: "yourFilePath/parsers/PPD.yaml"

  # Configure the proxy group for each subscription link
  - reg: nunhcf
    file: "yourFilePath/parsers/NEX.js"
  - reg: dogapi
    file: "yourFilePath/parsers/PPD.js"
  - reg: tag
    file: "yourFilePath/parsers/TAG.js"  

  # Epllogue
  # Add custom rules
  - reg: ^.*$
    file: "yourFilePath/parsers/mix-rule-providers.yaml"
  # Optimize the speed when downloading providers
  - reg: ^.*$
    file: "yourFilePath/parsers/download-providers-fast.js"
```

改好 parsers 的配置后, 修改 [default-proxy-groups.yaml](./parsers/default-proxy-groups.yaml), 根据你自身需求修改成你想要的分组情况(可以随意增加或者减少分组).
注: 修改我的默认分组后想让配置文件生效需要一些修改我写的一些函数, 因此需要一些 JavaScript 的基础, 你可以在互联网上搜索相关信息. 如果使用我的默认分组的话可以在接下来省去大量麻烦.

如果你有 proxy-providers 的需求, 你可以参照我的[模板文件](./mix-proxy-providers-template.yaml)做修改(由于该文件涉及到订阅信息, 所以并没有上传).你可以修改存放路径, 更新间隔等等. 不需要使用 proxy-providers 可以跳过这一步.

接下来你可以参照我列出的文件将你某一个订阅链接的节点按地区分组: [NEX.yaml](./parsers/NEX.yaml), [TAG.yaml](./parsers/TAG.yaml), [PPD.yaml](./parsers/PPD.yaml). 完成这个文件后, 在 parsers 的配置里的`# Group proxy by region`部分添加你新建的这个文件,以及可以匹配你的订阅链接的正则表达式. 并且删除我原有的配置. 添加后情况如下:

```yaml
  # 根据你的情况,你可以添加多个文件
  # Group proxy by region
  - reg: 可以匹配你的订阅连接的正则表达式
    file: "yourFilePath/parsers/你新创建的文件名.yaml"
  *************************************************
  - reg: nunhcf
    file: "yourFilePath/parsers/NEX.yaml"
  - reg: tag
    file: "yourFilePath/parsers/TAG.yaml"
  - reg: dogapi
    file: "yourFilePath/parsers/PPD.yaml"
  ***************************************************
  # 由**包裹的是我的配置,你应该将其删除
```

之后, 再向你的默认节点分组添加 proxies, 假设你修改 [default-proxy-groups.yaml](./parsers/default-proxy-groups.yaml) 后, 这个文件变成下面的情况

```yaml
      prepend-proxy-groups: # 建立策略组

        - name: PROXY
          type: select
          proxies:

        - name: AI
          type: select
          proxies:

        - name: Amazon
          type: select
          proxies:

        - name: Microsoft
          type: select
          proxies:

        - name: Netflix
          type: select
          proxies:

        - name: Spotify
          type: select
          proxies:

        - name: Telegram
          type: select
          proxies:

        - name: foo
          type: select
          proxies:

        - name: bar
          type: select
          proxies:        

        - name: Reject
          type: select
          proxies:
            - REJECT
            - PROXY

        - name: Final
          type: select
          proxies:
            - PROXY
            - DIRECT
```

并且假设你的订阅链接里的节点只有5个主流地区的节点, 你的按地区将节点分组的文件应该为下面情况
```yaml
append-proxy-groups: # 建立策略组

        - name: HK 
          type: select

        - name: TW
          type: select

        - name: SG 
          type: select

        - name: JP
          type: select

        - name: US
          type: select
```

基于上述假设, 接下来我们新建一个 你新创建的文件名.js 文件(基于这些文件修改: [NEX.yaml](./parsers/NEX.yaml), [TAG.yaml](./parsers/TAG.yaml), [PPD.yaml](./parsers/PPD.yaml).), 为我们的默认分组添加 proxies.

``` javascript
const { updateProxyGroups } = require('./assignProxyGroup');

module.exports.parse = (raw, { yaml, console }) => {
    const rawObj = yaml.parse(raw);
    const combineAndDeduplicate = (...arrays) => {
        return [...new Set(arrays.flat())];
    }

    // const baseProxy = ["HK", "TW", "SG", "KR", "JP", "US", "UK", 
    //                    "Asia", "Oceania", "America", "Europe"];
    // 这是 baseProxy 数组, 根据我们的情况(假设只有5大主流地区), 我们需要修改为:
    const baseProxy = ["HK", "TW", "SG", "JP", "US"]

    // 下面的三个数组根据你的需求修改
    // 他们利用 baseProxy 数组, 生成了其他的数组
    // 他们的值分别是:
    // MustProxy: ["PROXY", "HK", "TW", "SG", "JP", "US"]
    // DirectFirst: ["DIRECT", "PROXY", "HK", "TW", "SG", "JP", "US"]
    // ProxyFirst: ["PROXY", "DIRECT", "HK", "TW", "SG", "JP", "US"]
    const MustProxy = ["PROXY", ...baseProxy];
    const DirectFirst = ["DIRECT", ...MustProxy];
    const ProxyFirst = ["PROXY", "DIRECT", ...baseProxy];

    // 下面的数组是为了满足一些特殊情况, 例如:
    // 在我的 AI 分组中, claud.ai 只允许在 US 和 UK 使用, 但是部分机场的其他地区的节点也会对其做解锁, 所以我并没有排除
    // 其他地区的节点所以我将 US 和 UK 的优先级提高, 因此需要修改 AI 数组为: (combineAndDeduplicate是一个函数, 用于合并数组并去重)
    // 如果你的机场没有这种情况, 你可以将 AI 数组修改为: 
    // const AI = ["US", "UK"];
    const AI = combineAndDeduplicate(["US", "UK"], MustProxy);

    // 在我的 HamiVideo 分组中, claud.ai 只允许在 TW 使用, 所以我需要修改 HamiVideo 数组为:
    const HamiVideo = combineAndDeduplicate(["TW"], MustProxy);
    // starPlus 只允许使用南美地区的节点的节点
    const StarPlusLogin = combineAndDeduplicate(["America"], MustProxy);

    const StarPlus = combineAndDeduplicate(["US"], MustProxy);

    // 下面这行代码是将上面的数组传入 updateProxyGroups 函数, 生成新的配置文件, 如果你使用的是我的默认分组, 你不需要修改这行代码
    const updatedRawObj = updateProxyGroups(rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, HamiVideo, StarPlusLogin, StarPlus });
    
    return yaml.stringify(updatedRawObj);
};
```

假如你修改了默认分组, 接下来请修改 [assignProxyGroup.js 文件](./parsers/assignProxyGroup.js), 我们还是基于上述的假设, 你的默认分组为

```yaml
      prepend-proxy-groups: # 建立策略组

        - name: PROXY
          type: select
          proxies:

        - name: AI
          type: select
          proxies:

        - name: Amazon
          type: select
          proxies:

        - name: Microsoft
          type: select
          proxies:

        - name: Netflix
          type: select
          proxies:

        - name: Spotify
          type: select
          proxies:

        - name: Telegram
          type: select
          proxies:

        - name: foo
          type: select
          proxies:

        - name: bar
          type: select
          proxies:        

        - name: Reject
          type: select
          proxies:
            - REJECT
            - PROXY

        - name: Final
          type: select
          proxies:
            - PROXY
            - DIRECT
```

assignProxyGroup.js 可以按照下面的方式修改

```javascript
// 旧的函数声明
// module.exports.updateProxyGroups = (rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, HamiVideo, StarPlusLogin, StarPlus }) => {
module.exports.updateProxyGroups = (rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, bar }) => {
    // 这是一个proxies为 MustProxy 的 proxy-groups 的集合
    // const MustProxyGroup = ["Amazon", "Disney", "Emby", "Google", 
    //                         "HBOMAX", "Netflix", "Spotify", "Steam", 
    //                         "Speedtest", "Twitter", "Telegram", "YouTube"
    //                         ];
    // 根据你的默认分组的情况, 以及你的需求, 修改这个数组
    // 基于我们的假设, 只有 Netflix, Amazon, Telegram 必须走代理, 因此这个数组修改为
    const MustProxyGroup = ["Amazon", "Netflix", "Telegram"];
    
    // const DirectFirstGroup = ["Apple", "Bilibili", "China", "Coursera"];
    // 假设 foo 可以走代理, 但是也可以直连, 根据我们的情况, 我们选择优先走直连
    // 因此这个数组修改为
    const DirectFirstGroup = ["foo"];

    // const ProxyFirstGroup = ["Microsoft", "PayPal", "Scholar", "Tiktok"];
    // 有Microsoft, Spotify 可以走代理, 但是也可以直连, 根据我们的情况, 我们选择优先走代理
    // 因此这个数组修改为
    const ProxyFirstGroup = ["Microsoft", "Spotify"];

    

    const { 'proxy-groups': proxy = [] } = rawObj;
    // 遍历所有的默认分组
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
        } else if (group.name === "bar") {
            // 假设我们的 bar 分组, 情况特殊, 只允许香港节点
            // 因此我们需要传递一个只有香港节点的数组, 假设这个数组为 bar
            // 因此我们需要修改 函数的参数, 传递一个 bar 数组
            // 并且将下面的 HamiVideo, StarPlusLogin, StarPlus 删除
            group.proxies = bar;
        }
        //else if (group.name === "HamiVideo") {
        //     group.proxies = HamiVideo;
        // } else if (group.name === "StarPlusLogin") {
        //     group.proxies = StarPlusLogin;
        // } else if (group.name === "StarPlus") {
        //     group.proxies = StarPlus;
        // } 
    });

    rawObj['proxy-groups'] = proxy;
    return rawObj;
};
```

在修改完 assignProxyGroup.js 后, 我们需要再次修改 你新创建的文件名.js, 将调用函数的部分修改, 并且增加数组bar, 结果如下

```javascript
const bar = ['HK'];
const updatedRawObj = updateProxyGroups(rawObj, { MustProxy, DirectFirst, ProxyFirst, baseProxy, AI, bar});
```

这样子这个文件才算完全修改成功,完成这个文件后应该添加这个文件到 parser 中, 添加后的情况如下:

```yaml
  # 根据你的情况,你可以添加多个文件
  # Configure the proxy group for each subscription link
  - reg: 可以匹配你的订阅连接的正则表达式
    file: "yourFilePath/parsers/你新创建的文件名.js"
  *************************************************
  - reg: nunhcf
    file: "/home/rice/util/Clash-rule-set/parsers/NEX.js"
  - reg: dogapi
    file: "/home/rice/util/Clash-rule-set/parsers/PPD.js"
  - reg: tag
    file: "/home/rice/util/Clash-rule-set/parsers/TAG.js" 
  ***************************************************
  # 由**包裹的是我的配置,你应该将其删除
```

接下来是修改 [mix-rule-providers.yaml](./parsers/mix-rule-providers.yaml), 参照我的文件以及对照你自己的默认分组进行修改即可.

最后是 [download-providers-fast.js](./parsers/download-providers-fast.js), 这个文件的目的是为了加快下载 providers 的速度, 
因为 clash 在下载 providers 的时候是不走代理, 导致下载 providers 的时候会出现很多问题, 因此我们利用 parsers 机制, 下载 providers, 
并且将下载好的 providers 保存到本地, 并且修改配置文件中的 providers , 使其类型变为 file, 并且指向我们下载好的 providers 文件.

还有要注意一点的是, 虽然 proxy-providers 的配置文件中有大量重复的 url, 但在 dwonload-providers-fast.js 中, 有处理该问题的代码, 
同时对于已经保存到本地的 proxy-providers 文件, 也不会再次尝试保存.

```javascript
// 如果URL尚未被下载，那么下载它
if (!downloadedUrls.has(obj.url)) {
    const ret = await axios({
        method: 'get',
        url: obj.url,
    });
    responseData = ret.data;
    downloadedUrls.add(obj.url); // 将URL添加到已下载集合中
}

...

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
```