### DONEs
| Filename | line # | DONE
|:------|:------:|:------
| v2/auth.js | 109 | [@hhdem](https://github.com/hhdem) ~~提醒激活不然无法继续进行下一步操作~~
| v2/board.js | 57 |  ~~Board 信息查看接口~~
| v2/board.js | 150 | [@hhdem](https://github.com/hhdem) ~~关注 board~~
| v2/board.js | 210 | [@hhdem](https://github.com/hhdem) ~~取消关注 board~~
| v2/board.js | 266 | [@hhdem](https://github.com/hhdem) ~~关注列表~~
| v2/board.js | 326 | [@hhdem](https://github.com/hhdem) ~~删除图片~~
| v2/image.js | 120 | [@hhdem](https://github.com/hhdem) ~~此处需要优化, 不要每次都获得全部喜欢的图片列表, 改为根据返回的图片列表, 查询是否like~~
| v2/image.js | 176 | [@hhdem](https://github.com/hhdem) ~~考虑如何把 hamming 距离改成 SIFT 算法或 pHash 算法, 最终改了 gHash, 依然需要优化~~
| v2/image.js | 290 | [@hhdem](https://github.com/hhdem) ~~修改为每次GET操作都生成新的topic对象, 但是图片地址不改变, 目前是添加了一个 TopicBoard 的关系对象~~
| v2/image.js | 338 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| v2/image.js | 385 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| v2/image.js | 423 | [@hhdem](https://github.com/hhdem) ~~增加Board信息的返回,以及统计信息~~
| v2/image.js | 526 | [@hhdem](https://github.com/hhdem) ~~删除图片~~
| v2/topic.js | 253 | [@hhdem](https://github.com/hhdem) ~~创建 topic 时可以关联已发布的图片~~
| counter.js | 170 | [@hhdem](https://github.com/hhdem) ~~增加 err 的错误校验, 返回对应的错误信息~~
| store_local.js | 55 | [@hhdem](https://github.com/hhdem) ~~上传未结束就读取文件生成hash, 导致报找不到文件错, 原有的file.on('end') 改为 file.pipe().on('close')方式, 真正在写结束后调用回掉函数, 此处需要注意如果不需要上传后对图片做分析可以不用等待直接用原有的方法~~
| store_local.js | 63 | [@hhdem](https://github.com/hhdem) ~~上传图片时裁剪生成 86 像素宽的缩略图, 存储到upload下~~
| board.js | 8 | [@hhdem](https://github.com/hhdem) ~~用户Board列表~~
| board.js | 56 | [@hhdem](https://github.com/hhdem) ~~用户Board信息查看, 显示Board中的图片列表~~
| board.js | 183 |  ~~用户Board列表页创建Board信息~~
| board.js | 232 | [@hhdem](https://github.com/hhdem) ~~用户Board列表页修改Board信息~~
| board.js | 245 | [@hhdem](https://github.com/hhdem) ~~管理员修改 Board 信息~~
| dashboard.js | 13 | [@hhdem](https://github.com/hhdem) ~~管理员维护界面 Dashboard, 统计数据的获取~~
| dashboard.js | 73 | [@hhdem](https://github.com/hhdem) ~~管理员维护界面 board 列表~~
| dashboard.js | 97 | [@hhdem](https://github.com/hhdem) ~~管理员维护界面 用户 列表~~
| dashboard.js | 122 | [@hhdem](https://github.com/hhdem) ~~管理员节点管理界面~~
| dashboard.js | 155 | [@hhdem](https://github.com/hhdem) ~~所有Forum列表~~
| dashboard.js | 233 | [@hhdem](https://github.com/hhdem) ~~删除图片时，删除Model对象~~
| forum.js | 5 | [@hhdem](https://github.com/hhdem) ~~Forum信息添加和修改~~
| forum.js | 95 | [@hhdem](https://github.com/hhdem) ~~Forum信息查看~~
| image.js | 243 | [@hhdem](https://github.com/hhdem) ~~不对val进行inspect~~
| image.js | 244 | [@hhdem](https://github.com/hhdem) ~~上传图片支持 7牛云, 增加对应的配置~~
| image.js | 245 | [@hhdem](https://github.com/hhdem) ~~更改hash参数生成方式为 ghash~~
| image.js | 246 | [@hhdem](https://github.com/hhdem) ~~上传完图片后, 异步返回结果, 而不是等待 hash值 和 colors的获取~~
| image.js | 285 | [@hhdem](https://github.com/hhdem) ~~上传图片时与Board进行关联绑定, 目前Get图片已经做了关联, 上传图片还未做~~
| image.js | 374 | [@hhdem](https://github.com/hhdem) ~~自动旋转图片方向, 此处代码优化性能, 挪到 store_local 中~~
| image.js | 505 | [@hhdem](https://github.com/hhdem) ~~上传图片时与Board进行关联绑定, 目前Get图片已经做了关联, 上传图片还未做~~
| image.js | 611 | [@hhdem](https://github.com/hhdem) ~~自动旋转图片方向, 此处代码优化性能, 挪到 store_local 中~~
| node.js | 4 | [@hhdem](https://github.com/hhdem) ~~管理员创建节点~~
| node.js | 59 | [@hhdem](https://github.com/hhdem) ~~查看节点信息~~
| topic.js | 31 | [@hhdem](https://github.com/hhdem) ~~在 Topic 模型中增加 board 关联~~
| api/v1/message.test.js | 27 | [@hhdem](https://github.com/hhdem) ~~accessToken 的问题导致测试用例失败~~
| api/v2/image.test.js | 104 | [@hhdem](https://github.com/hhdem) ~~增加 Image 图片上传测试用例: 上传两张图片后, 进行 hamming 距离计算~~
| controllers/image.test.js | 68 | [@hhdem](https://github.com/hhdem) ~~增加 Image 图片上传测试用例: 上传后计数统计是否正确~~
| controllers/image.test.js | 108 | [@hhdem](https://github.com/hhdem) ~~增加 Image 图片上传测试用例: 上传后计数统计是否正确~~
| common/cache.test.js | 46 |  ~~;~~
| common/counter.test.js | 54 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 创建主题后增加用户积分和主题数~~
| common/counter.test.js | 92 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 删除主题后减少用户积分和主题数~~
| common/counter.test.js | 180 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 收藏主题后增加用户收藏主题数~~
| common/counter.test.js | 212 | [@hhdem](https://github.com/hhdem) ~~添加测试用例: 取消收藏主题后减少用户收藏主题数~~
| index.html | 11 | [@hhdem](https://github.com/hhdem) ~~首页中板块切换修改为ajax请求~~
| index.html | 54 | [@hhdem](https://github.com/hhdem) ~~用户信息显示的样式调整, 参考花瓣网~~
| index.html | 58 | [@hhdem](https://github.com/hhdem) ~~用户统计信息获取~~
| dashboard/boards.html | 104 |  ~~管理员Board列表，点击修改弹出修改模态框并可修改Board信息~~
| dashboard/forums.html | 1 | [@hhdem](https://github.com/hhdem) ~~管理员面板管理页面~~
| dashboard/nodes.html | 1 | [@hhdem](https://github.com/hhdem) ~~管理员面板管理页面~~
| board/topics.html | 83 | [@hhdem](https://github.com/hhdem) ~~修改颜色显示样式为，github中的消息头像样式，伸缩覆盖的效果~~
| topic/_pic_box.html | 1 | [@hhdem](https://github.com/hhdem) ~~点击图片Box, 弹出浏览图片的modal, 查看图片详情~~
| topic/_pic_box.html | 2 | [@hhdem](https://github.com/hhdem) ~~Get 图片功能按钮实现~~
| topic/_pic_box.html | 3 | [@hhdem](https://github.com/hhdem) ~~喜欢图片功能按钮实现~~
| topic/_pic_box.html | 4 | [@hhdem](https://github.com/hhdem) ~~图片发布人信息显示, 目前为写死~~
| topic/_pic_box.html | 27 | [@hhdem](https://github.com/hhdem) ~~修改颜色显示样式为，github中的消息头像样式，伸缩覆盖的效果~~
| topic/_pic_create_modal.html | 8 | [@hhdem](https://github.com/hhdem) ~~modal 层会不定时的覆盖屏幕区域,点击会弹出选择图片窗口~~
| topic/_pic_create_modal.html | 9 | [@hhdem](https://github.com/hhdem) ~~点击上传图片后弹出的模态框中确认上传按钮样式错误~~
| topic/_pic_create_modal.html | 10 | [@hhdem](https://github.com/hhdem) ~~chrome 插件直接采集~~
| topic/_pic_create_modal.html | 11 | [@hhdem](https://github.com/hhdem) ~~弹出层上传文件, 文件只能单选, 默认描述是文件名~~
| topic/_pic_preview_modal.html | 65 | [@hhdem](https://github.com/hhdem) ~~点击图片Box, 弹出浏览图片的modal, 图片 Board 信息显示功能, Board统计信息和 Board 中的图片列表~~
| user/_index_boards.html | 1 | [@hhdem](https://github.com/hhdem) ~~用户 Board 列表页面~~
| user/images.html | 56 | [@hhdem](https://github.com/hhdem) ~~修改颜色显示样式为，github中的消息头像样式，伸缩覆盖的效果~~
| user/index.html | 1 | [@hhdem](https://github.com/hhdem) ~~用户首页中列表显示错误~~
| user/index.html | 2 | [@hhdem](https://github.com/hhdem) ~~用户首页中样式调整~~
| user/index.html | 97 | [@hhdem](https://github.com/hhdem) ~~用户信息页面中板块切换修改为ajax请求~~
| _pic_preview_modal.less | 2 | [@hhdem](https://github.com/hhdem) ~~目前只有点击右上角的Close才能关闭 查看 窗口, 需要点击白色遮罩层也要关闭 查看 窗口~~
| pics.less | 779 | [@hhdem](https://github.com/hhdem) ~~目前只有点击右上角的Close才能关闭 查看 窗口, 需要点击白色遮罩层也要关闭 查看 窗口~~
| style.less | 64 | [@hhdem](https://github.com/hhdem) ~~文章详情查看的时候底色没了~~

### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| v2/topic.js | 251 |  创建 topic 时可以选择管理员维护的 area，在列表和详细信息查看中加入 area 标签显示
| v2/topic.js | 252 |  创建 topic 时可以发布到不同的 team 中，在列表和详细信息查看中加入 team 的标签显示
| v2/topic.js | 254 |  微信小程序记录轨迹
| board.js | 176 |  用户Board信息删除
| dashboard.js | 68 |  管理员维护界面 tag 列表
| forum.js | 137 |  Forum信息删除
| image.js | 307 | [@hhdem](https://github.com/hhdem) 图片 hash 和 colors 的生成顺序需要优化, 前台不依赖于后台返回的 hash 和 colors, 而是自己生成
| team.js | 1 |  v2 小组列表
| team.js | 6 |  v2 用户已加入小组列表
| team.js | 11 |  v2 创建小组
| team.js | 16 |  v2 修改小组信息
| team.js | 21 |  v2 查看小组信息
| team.js | 26 |  v2 查看小组成员信息
| team.js | 31 |  v2 加入小组
| team.js | 36 |  v2 退出小组
| trip.js | 1 |  v2 用户可以创建活动，以及活动结束后可以通过微信小程序共享轨迹
| trip.js | 2 |  v2 需要绑定 google 地图，显示活动轨迹
| trip.js | 3 |  v2 活动状态更新
| user.js | 519 |  点击首页Get数量，进入用户Get的图片列表页面
| user.js | 560 |  点击首页Board数量，进入用户 Board 列表页面
| user.js | 567 |  点击首页积分，进入用户 积分明细页面 的图片列表页面
| controllers/image.test.js | 119 |  增加 Image 图片上传测试用例: 上传后 hash 值是否正确
| index.html | 59 | [@hhdem](https://github.com/hhdem) 点击统计信息进入用户面板页面
| index.html | 96 |  Signin with wechat and QQ account
| dashboard/boards.html | 1 |  管理员的Board列表页功能
| dashboard/boards.html | 78 |  管理员Board列表，搜索功能
| dashboard/boards.html | 89 |  管理员Board列表，点击删除Board可以删除选定Board
| dashboard/boards.html | 113 |  用户修改Board信息
| dashboard/index.html | 1 |  管理员面板页面，统计数据获取，
| dashboard/users.html | 1 |  管理员的用户列表页面中加入，禁言、修改
| dashboard/users.html | 2 |  Tab页切换修改为ajax请求
| dashboard/users.html | 81 |  管理员用户列表，点击添加用户弹出新增模态框，创建用户
| dashboard/users.html | 82 |  管理员用户列表，点击删除用户可以删除选定用户
| dashboard/users.html | 99 |  管理员用户列表，点击修改弹出修改模态框并可修改用户信息
| board/_board_create_search.html | 6 |  Tag添加
| board/index.html | 50 |  用户修改Board信息
| topic/_pic_preview_modal.html | 80 |  关注board按钮实现
| user/card.html | 47 |  Signin with wechat and QQ account
| user/index.html | 3 |  我的页面中增加 Board 管理