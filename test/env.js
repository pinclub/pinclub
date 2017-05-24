var nock = require('nock');
var redis = require('../common/redis');
var restore = require('mongodb-restore');
var path = require('path');
var config = require('../config');

nock.enableNetConnect(); // 允许真实的网络连接

redis.flushdb(); // 清空 db 里面的所有内容

// restore the function to test db
// restore({
//     uri: config.db + config.dbname, // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
//     root: path.join(__dirname, '../bin/dbstore/'+config.dbname),
//     drop: true,
//     callback: function (err) {
//         console.info(err);
//     }
// });