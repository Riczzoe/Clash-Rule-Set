暂时没有想到怎么样灵活的为订阅链接添加 proxy-provider, 所以目前只能为每个订阅链接写一个yaml文件:

首先你需要新建一个 proxy-provider 的配置文件, 该文件包含你的 proxy-provider, 参考 [mix-proxy-providers-template.yaml](./mix-proxy-providers-template.yaml) 中的示例. 

然后为你的订阅链接新建一个yaml文件, 我给我的订阅链接新建了一个 [NEX.yaml](./parsers/NEX.yaml) 文件. 该文件中的每个分组的use字段指向你创建的 proxy-provider 的配置文件中的 proxy-provider 的名字. 你可以根据你的需求修改该文件中的每个分组的use字段.

