var app = require('../../app');
var request = require('supertest')(app);
var support = require('../support/support');

describe('test/controllers/node.test.js', function () {

    var mockNode, mockNodeUnChanged;

    before(function (done) {
        support.createNode(support.adminUser.id, null, function (err, node) {
            mockNode = node;
            support.createNode(support.adminUser.id, null, function (err, node2) {
                mockNodeUnChanged = node2;
                done();
            });
        });
    });

    describe('create node', function () {
        it('should add a node', function (done) {
            request.post('/admin/nodes')
                .send({
                    name: 'Node name',
                    content: 'Node content',
                    code: 'Node code',
                    user: support.adminUser.id
                })
                .set('Cookie', support.adminUserCookie)
                .expect(302, function (err, res) {
                    res.headers.location.should.match(/^\/admin\/nodes$/);
                    done(err);
                });
        });

        it('should not add node when params not right', function (done) {
            request.post('/admin/nodes')
                .send({
                    name: '',
                    content: 'Node content',
                    code: 'Node code',
                    user: support.adminUser.id
                })
                .set('Cookie', support.adminUserCookie)
                .expect(400, function (err, res) {
                    res.body.success.should.false();
                    res.text.should.containEql('参数验证失败');
                    res.text.should.containEql('节点名称不能为空');
                    done(err);
                });
        });

        it('should not create a node when user not login', function (done) {
            request.post('/admin/nodes')
                .send({
                    name: '',
                    content: 'Node content',
                    code: 'Node code',
                    user: support.adminUser.id
                })
                .expect(200, function (err, res) {
                    res.text.should.containEql('你还没有登录。');
                    done(err);
                });
        });

        it('should not create a node if is not a admin', function (done) {
            request.post('/admin/nodes')
                .send({
                    name: '',
                    content: 'Node content',
                    code: 'Node code',
                    user: support.adminUser.id
                })
                .set('Cookie', support.normalUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('需要管理员权限。');
                    done(err);
                });
        });
    });

    describe('edit node', function () {
        it('should edit node successful', function (done) {
            request.post('/admin/nodes')
                .send({
                    id: mockNode.id,
                    name: 'new Node name',
                    content: 'Node content',
                    code: 'Node code',
                    user: support.adminUser.id
                })
                .set('Cookie', support.adminUserCookie)
                .expect(302, function (err, res) {
                    res.headers.location.should.match(/^\/admin\/nodes$/);
                    done(err);
                });
        });

        it('should not edit node when params not right', function (done) {
            done();
        });

        it('should not edit node when user not login', function (done) {
            done();
        });

        it('should not edit page if is not a admin', function (done) {
            done();
        });

        it('should update edit', function (done) {
            done();
        });
    });

    describe('list node', function () {
        it('should list all nodes', function (done) {
            request.get('/admin/nodes')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql('Node code');
                    done(err);
                });
        });
    });

    describe('show node', function () {
        it('should show correct info of node', function (done) {
            request.get('/admin/nodes/' + mockNodeUnChanged.id)
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.containEql(mockNodeUnChanged.name);
                    done(err);
                });
        });

        it('should return error when try to get an unexist node', function (done) {
            request.get('/admin/nodes/' + support.adminUser.id)
                .set('Cookie', support.adminUserCookie)
                .expect(404, function (err, res) {
                    res.text.should.containEql('节点不存在');
                    done(err);
                });
        });
    });
});

