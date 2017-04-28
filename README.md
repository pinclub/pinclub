Pinclub
=======

[![node version][node-image]][node-url]

[node-image]: https://img.shields.io/badge/node.js-%3E=_4.2-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

## 介绍

Pinclub 是基于 Nodeclub 进行的二次开发. 增加了瀑布流展示方式, 主要参考花瓣网的设计风格(感谢花瓣网的设计师和前端工程师的辛勤工作), 加入了hanming距离的算法, 当然是在mongodb中使用了 function 的形式实现.

## 图片相似度算法说明

在 Topic 模型中加入了 image 的相关属性值, 其中就包括 image_hash, 使用 imghash 模块生成了 16 bits 的二进制字符串.

在 Mongodb 中创建了一个 function 命名为 hammingDistance, 代码如下:

```
function (a, b) {
    var aa = a.split("");
    var bb = b.split("");
    var count = 0;
    for (var i = 0; i < aa.length; i++) if (aa[i] !== bb[i]) count++;
        return count;
}
```

## TODO

如果你想贡献一份力量, 请查看 [TODO](https://github.com/pinclub/pinclub/blob/master/TODO.md) 列表

## 安装部署

*不保证 Windows 系统的兼容性*

线上跑的是 [Node.js](https://nodejs.org) v4.4.0，[MongoDB](https://www.mongodb.org) 是 v3.0.5，[Redis](http://redis.io) 是 v3.0.3。

```
1. 安装 `Node.js/io.js[必须]` `MongoDB[必须]` `Redis[必须]`
2. 启动 MongoDB 和 Redis
3. `$ make install` 安装 Nodeclub 的依赖包
4. `cp config.default.js config.js` 请根据需要修改配置文件
5. `$ make test` 确保各项服务都正常
6. `$ node app.js`
7. visit `http://localhost:3000`
8. done!
```

## API接口文档

使用 npm run apidoc 命令在本地生成文档后, 访问: http://localhost:3000/public/apidoc

## 关于 Nodeclub

Nodeclub 是使用 **Node.js** 和 **MongoDB** 开发的社区系统，界面优雅，功能丰富，小巧迅速，
已在Node.js 中文技术社区 [CNode(http://cnodejs.org)](http://cnodejs.org) 得到应用，但你完全可以用它搭建自己的社区。

## 测试(完善中)

跑测试

```bash
$ make test
```

跑覆盖率测试

```bash
$ make test-cov
```

## 贡献

Pinclub 可以联系 [@hhdem](https://github.com/hhdem)

Nodeclub 有任何意见或建议都欢迎提 issue，或者直接提给 [@alsotang](https://github.com/alsotang)

## License

MIT
