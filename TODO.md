### DONEs
| Filename | line # | DONE
|:------|:------:|:------
| v2/auth.js | 100 | [@hhdem](https://github.com/hhdem) ~~提醒激活不然无法继续进行下一步操作~~
| store_local.js | 21 | [@hhdem](https://github.com/hhdem) ~~上传未结束就读取文件生成hash, 导致报找不到文件错, 原有的file.on('end') 改为 file.pipe().on('close')方式, 真正在写结束后调用回掉函数, 此处需要注意如果不需要上传后对图片做分析可以不用等待直接用原有的方法~~
| image.js | 450 | [@hhdem](https://github.com/hhdem) ~~不对val进行inspect~~
| topic/_pic_box.html | 3 | [@hhdem](https://github.com/hhdem) ~~喜欢图片功能按钮实现~~
| topic/_pic_box.html | 4 | [@hhdem](https://github.com/hhdem) ~~图片发布人信息显示, 目前为写死~~
| topic/_pic_list.html | 29 | [@hhdem](https://github.com/hhdem) ~~modal 层会不定时的覆盖屏幕区域,点击会弹出选择图片窗口~~
| topic/_pic_list.html | 32 | [@hhdem](https://github.com/hhdem) ~~弹出层上传文件, 文件只能单选, 默认描述是文件名~~

### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| v2/image.js | 89 |  此处需要优化,不要每次都获得全部喜欢的图片列表
| v2/image.js | 369 |  增加 err 的错误校验, 返回对应的错误信息
| v2/image.js | 375 |  增加 err 的错误校验, 返回对应的错误信息
| v2/image.js | 392 |  增加Board信息的返回,以及统计信息
| v2/topic.js | 97 |  此处需要优化,不要每次都获得全部喜欢的图片列表
| image.js | 497 |  上传图片时与Board进行关联绑定, 目前Get图片已经做了关联, 上传图片还未做
| index.html | 9 | [@hhdem](https://github.com/hhdem) 用户信息显示的样式调整, 参考花瓣网
| index_pic.html | 9 | [@hhdem](https://github.com/hhdem) 用户信息显示的样式调整, 参考花瓣网
| index_pic.html | 13 |  用户统计信息获取, 目前为写死
| topic/_pic_box.html | 1 | [@hhdem](https://github.com/hhdem) 点击图片Box, 弹出浏览图片的modal, 查看图片详情
| topic/_pic_box.html | 2 |  采集图片功能按钮实现
| topic/_pic_box.html | 5 |  图片Board功能
| topic/_pic_list.html | 31 | [@hhdem](https://github.com/hhdem) chrome 插件直接采集
| user/index.html | 3 |  我的页面中增加 Board 管理

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| topic/_pic_list.html | 30 | [@hhdem](https://github.com/hhdem) 点击上传图片后弹出的模态框中确认上传按钮样式错误
| user/index.html | 1 |  用户首页中列表显示错误
| user/index.html | 2 |  用户首页中样式调整
| style.less | 57 | [@hhdem](https://github.com/hhdem) 文章详情查看的时候底色没了