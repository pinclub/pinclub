### DONEs
| Filename | line # | DONE
|:------|:------:|:------
| v2/auth.js | 100 | [@hhdem](https://github.com/hhdem) ~~提醒激活不然无法继续进行下一步操作~~
| v2/image.js | 98 | [@hhdem](https://github.com/hhdem) ~~此处需要优化, 不要每次都获得全部喜欢的图片列表, 改为根据返回的图片列表, 查询是否like~~
| v2/image.js | 282 | [@hhdem](https://github.com/hhdem) ~~修改为每次GET操作都生成新的topic对象, 但是图片地址不改变, 目前是添加了一个 TopicBoard 的关系对象~~
| v2/image.js | 330 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| v2/image.js | 374 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| v2/image.js | 383 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| v2/image.js | 402 | [@hhdem](https://github.com/hhdem) ~~增加Board信息的返回,以及统计信息~~
| store_local.js | 33 | [@hhdem](https://github.com/hhdem) ~~上传未结束就读取文件生成hash, 导致报找不到文件错, 原有的file.on('end') 改为 file.pipe().on('close')方式, 真正在写结束后调用回掉函数, 此处需要注意如果不需要上传后对图片做分析可以不用等待直接用原有的方法~~
| store_local.js | 36 | [@hhdem](https://github.com/hhdem) ~~上传图片时裁剪生成 86 像素宽的缩略图, 存储到upload下~~
| image.js | 453 | [@hhdem](https://github.com/hhdem) ~~不对val进行inspect~~
| image.js | 551 | [@hhdem](https://github.com/hhdem) ~~上传图片时与Board进行关联绑定, 目前Get图片已经做了关联, 上传图片还未做~~
| topic.js | 30 | [@hhdem](https://github.com/hhdem) ~~在 Topic 模型中增加 board 关联~~
| index.html | 9 | [@hhdem](https://github.com/hhdem) ~~用户信息显示的样式调整, 参考花瓣网~~
| index_pic.html | 9 | [@hhdem](https://github.com/hhdem) ~~用户信息显示的样式调整, 参考花瓣网~~
| index_pic.html | 13 | [@hhdem](https://github.com/hhdem) ~~用户统计信息获取~~
| topic/_pic_box.html | 1 | [@hhdem](https://github.com/hhdem) ~~点击图片Box, 弹出浏览图片的modal, 查看图片详情~~
| topic/_pic_box.html | 2 | [@hhdem](https://github.com/hhdem) ~~Get 图片功能按钮实现~~
| topic/_pic_box.html | 3 | [@hhdem](https://github.com/hhdem) ~~喜欢图片功能按钮实现~~
| topic/_pic_box.html | 4 | [@hhdem](https://github.com/hhdem) ~~图片发布人信息显示, 目前为写死~~
| topic/_pic_list.html | 19 | [@hhdem](https://github.com/hhdem) ~~点击图片Box, 弹出浏览图片的modal, 图片 Board 信息显示功能, Board统计信息和 Board 中的图片列表~~
| topic/_pic_list.html | 38 | [@hhdem](https://github.com/hhdem) ~~modal 层会不定时的覆盖屏幕区域,点击会弹出选择图片窗口~~
| topic/_pic_list.html | 39 | [@hhdem](https://github.com/hhdem) ~~点击上传图片后弹出的模态框中确认上传按钮样式错误~~
| topic/_pic_list.html | 41 | [@hhdem](https://github.com/hhdem) ~~弹出层上传文件, 文件只能单选, 默认描述是文件名~~
| user/index.html | 1 | [@hhdem](https://github.com/hhdem) ~~用户首页中列表显示错误~~
| user/index.html | 2 | [@hhdem](https://github.com/hhdem) ~~用户首页中样式调整~~
| pics.less | 778 | [@hhdem](https://github.com/hhdem) ~~目前只有点击右上角的Close才能关闭 查看 窗口, 需要点击白色遮罩层也要关闭 查看 窗口~~
| style.less | 56 | [@hhdem](https://github.com/hhdem) ~~文章详情查看的时候底色没了~~

### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| v2/image.js | 155 |  考虑如何把 hamming 距离改成 SIFT 算法或 pHash 算法
| image.js | 489 |  此处需要考虑上传完图片后, 异步返回结果, 而不是等待 hash值 和 colors的获取, 前台只是需要个 id ,可以先生成id返回,之后再进行剩下的操作
| image.js | 490 |  图片 hash 和 colors 的生成顺序需要优化, 前台不依赖于后台返回的 hash 和 colors, 而是自己生成
| image.js | 498 |  自动旋转图片方向, 此处代码需要优化性能, 所以先注释掉
| index_pic.html | 14 | [@hhdem](https://github.com/hhdem) 点击统计信息进入用户面板页面
| topic/_pic_list.html | 40 | [@hhdem](https://github.com/hhdem) chrome 插件直接采集
| user/index.html | 3 |  我的页面中增加 Board 管理