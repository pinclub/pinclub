### DONEs
| Filename | line # | DONE
|:------|:------:|:------
| v2/auth.js | 101 | [@hhdem](https://github.com/hhdem) ~~提醒激活不然无法继续进行下一步操作~~
| v2/image.js | 97 | [@hhdem](https://github.com/hhdem) ~~此处需要优化, 不要每次都获得全部喜欢的图片列表, 改为根据返回的图片列表, 查询是否like~~
| v2/image.js | 151 | [@hhdem](https://github.com/hhdem) ~~考虑如何把 hamming 距离改成 SIFT 算法或 pHash 算法, 最终改了 gHash, 依然需要优化~~
| v2/image.js | 283 | [@hhdem](https://github.com/hhdem) ~~修改为每次GET操作都生成新的topic对象, 但是图片地址不改变, 目前是添加了一个 TopicBoard 的关系对象~~
| v2/image.js | 331 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| v2/image.js | 376 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| v2/image.js | 414 | [@hhdem](https://github.com/hhdem) ~~增加Board信息的返回,以及统计信息~~
| counter.js | 160 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| store_local.js | 45 | [@hhdem](https://github.com/hhdem) ~~上传未结束就读取文件生成hash, 导致报找不到文件错, 原有的file.on('end') 改为 file.pipe().on('close')方式, 真正在写结束后调用回掉函数, 此处需要注意如果不需要上传后对图片做分析可以不用等待直接用原有的方法~~
| store_local.js | 53 | [@hhdem](https://github.com/hhdem) ~~上传图片时裁剪生成 86 像素宽的缩略图, 存储到upload下~~
| image.js | 250 | [@hhdem](https://github.com/hhdem) ~~不对val进行inspect~~
| image.js | 251 | [@hhdem](https://github.com/hhdem) ~~上传图片支持 7牛云, 增加对应的配置~~
| image.js | 252 | [@hhdem](https://github.com/hhdem) ~~更改hash参数生成方式为 ghash~~
| image.js | 253 | [@hhdem](https://github.com/hhdem) ~~上传完图片后, 异步返回结果, 而不是等待 hash值 和 colors的获取~~
| image.js | 292 | [@hhdem](https://github.com/hhdem) ~~上传图片时与Board进行关联绑定, 目前Get图片已经做了关联, 上传图片还未做~~
| image.js | 378 | [@hhdem](https://github.com/hhdem) ~~自动旋转图片方向, 此处代码优化性能, 挪到 store_local 中~~
| topic.js | 30 | [@hhdem](https://github.com/hhdem) ~~在 Topic 模型中增加 board 关联~~
| api/v1/message.test.js | 27 | [@hhdem](https://github.com/hhdem) ~~accessToken 的问题导致测试用例失败~~
| api/v2/image.test.js | 104 | [@hhdem](https://github.com/hhdem) ~~增加 Image 图片上传测试用例: 上传两张图片后, 进行 hamming 距离计算~~
| common/counter.test.js | 54 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 创建主题后增加用户积分和主题数~~
| common/counter.test.js | 92 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 删除主题后减少用户积分和主题数~~
| common/counter.test.js | 180 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 收藏主题后增加用户收藏主题数~~
| common/counter.test.js | 212 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 取消收藏主题后减少用户收藏主题数~~
| controllers/image.test.js | 68 | [@hhdem](https://github.com/hhdem) ~~增加 Image 图片上传测试用例: 上传后计数统计是否正确~~
| index.html | 9 | [@hhdem](https://github.com/hhdem) ~~用户信息显示的样式调整, 参考花瓣网~~
| index_pic.html | 9 | [@hhdem](https://github.com/hhdem) ~~用户信息显示的样式调整, 参考花瓣网~~
| index_pic.html | 13 | [@hhdem](https://github.com/hhdem) ~~用户统计信息获取~~
| topic/_pic_box.html | 1 | [@hhdem](https://github.com/hhdem) ~~点击图片Box, 弹出浏览图片的modal, 查看图片详情~~
| topic/_pic_box.html | 2 | [@hhdem](https://github.com/hhdem) ~~Get 图片功能按钮实现~~
| topic/_pic_box.html | 3 | [@hhdem](https://github.com/hhdem) ~~喜欢图片功能按钮实现~~
| topic/_pic_box.html | 4 | [@hhdem](https://github.com/hhdem) ~~图片发布人信息显示, 目前为写死~~
| topic/_pic_box.html | 22 | [@hhdem](https://github.com/hhdem) ~~修改颜色显示样式为，github中的消息头像样式，伸缩覆盖的效果~~
| topic/_pic_create_modal.html | 3 | [@hhdem](https://github.com/hhdem) ~~modal 层会不定时的覆盖屏幕区域,点击会弹出选择图片窗口~~
| topic/_pic_create_modal.html | 4 | [@hhdem](https://github.com/hhdem) ~~点击上传图片后弹出的模态框中确认上传按钮样式错误~~
| topic/_pic_create_modal.html | 6 | [@hhdem](https://github.com/hhdem) ~~弹出层上传文件, 文件只能单选, 默认描述是文件名~~
| topic/_pic_list.html | 13 | [@hhdem](https://github.com/hhdem) ~~点击图片Box, 弹出浏览图片的modal, 图片 Board 信息显示功能, Board统计信息和 Board 中的图片列表~~
| user/index.html | 1 | [@hhdem](https://github.com/hhdem) ~~用户首页中列表显示错误~~
| user/index.html | 2 | [@hhdem](https://github.com/hhdem) ~~用户首页中样式调整~~
| pics.less | 786 | [@hhdem](https://github.com/hhdem) ~~目前只有点击右上角的Close才能关闭 查看 窗口, 需要点击白色遮罩层也要关闭 查看 窗口~~
| style.less | 56 | [@hhdem](https://github.com/hhdem) ~~文章详情查看的时候底色没了~~

### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| v2/board.js | 118 |  关注 board
| v2/board.js | 119 |  取消关注 board
| image.js | 316 | [@hhdem](https://github.com/hhdem) 图片 hash 和 colors 的生成顺序需要优化, 前台不依赖于后台返回的 hash 和 colors, 而是自己生成
| controllers/image.test.js | 80 |  增加 Image 图片上传测试用例: 上传后 hash 值是否正确
| index_pic.html | 14 | [@hhdem](https://github.com/hhdem) 点击统计信息进入用户面板页面
| topic/_pic_create_modal.html | 5 | [@hhdem](https://github.com/hhdem) chrome 插件直接采集
| user/index.html | 3 |  我的页面中增加 Board 管理