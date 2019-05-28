'use strict';

var loopback = require('loopback');
var IncludeThrough = require('../include-through');
var expect  = require('chai').expect;
var request = require('supertest');
var app = loopback();

app.set('legacyExplorer', false);
app.set('remoting', {
  context: false,
  cors: false,
});
app.use(loopback.rest());

// WIP more tests
describe('IncludeThrough', function() {
  var server;
  var User = null;
  var App = null;
  var UserRole = null;
  var db = null;

  /**
   * Create Data Source and Models
   **/
  db = app.dataSource('db', {adapter: 'memory'});

  var UserModel = app.registry.createModel('user');

  User = app.model(UserModel, {
    dataSource: 'db',
  });

  var AppModel = app.registry.createModel('app');

  App = app.model(AppModel, {
    dataSource: 'db',
  });

  var UserRoleModel = app.registry.createModel('userRole', {
    type: String,
    description: String,
  });

  UserRole = app.model(UserRoleModel, {
    dataSource: 'db',
  });

  User.hasMany(App, {through: UserRole, as: 'apps', foreignKey: 'userId'});
  App.hasMany(User, {through: UserRole, as: 'users', foreignKey: 'appId'});

  UserRole.belongsTo(User, {as: 'app', foreignKey: 'userId'});
  UserRole.belongsTo(App, {as: 'user', foreignKey: 'appId'});

  /**
   * Setup Mixin
   */
  IncludeThrough(App, {
    relations: [
      // 'users'
      {name: 'users', asProperty: 'userRole'},
    ],
    fields: {
      users: 'type',
    },
  });
  App.emit('attached');

  /**
   * Populate
   */
  User.create({});

  App.create({});

  UserRole.create({
    type: 'administrator',
    description: 'Can do whatever.',
    appId: 1,
    userId: 1,
  });

  beforeEach(function(done) {
    server = app.listen(done);
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('should include through model properties by default', function(done) {
    request(server).get('/apps/1/users')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        expect(res.text).to.equal(JSON.stringify([{
          id: 1,
          userRole: {
            type: 'administrator',
            userId: 1,
          },
        }]));
        done();
      });
  });

  it('should include through model properties when ask in a query', function(done) {
    request(server).get('/apps/1/users?filter=%7B%22includeThrough%22%3A%7B%22fields%22%3A%22description%22%7D%7D')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        expect(res.text).to.equal(JSON.stringify([{
          id: 1,
          userRole: {
            description: 'Can do whatever.',
            userId: 1,
          },
        }]));
        done();
      });
  });

  it('should get app normally (base case)', function(done) {
    request(server).get('/apps/1')
      .expect(200)
      .query({
        filter: JSON.stringify({
          include: '',
        }),
      })
      .end(function(err, res) {
        if (err) return done(err);

        expect(res.text).to.equal(JSON.stringify({id: 1}));
        done();
      });
  });

  it('should include through model properties by default (findById)', function(done) {
    request(server).get('/apps/1')
      .expect(200)
      .query({
        filter: JSON.stringify({
          include: 'users',
        }),
      })
      .end(function(err, res) {
        if (err) return done(err);

        expect(res.text).to.equal(JSON.stringify({
          id: 1,
          users: [
            {
              id: 1,
              userRole: {
                type: 'administrator',
                userId: 1,
              },
            },
          ],
        }));
        done();
      });
  });

  it('should include through model properties by default (findById)', function(done) {
    request(server).get('/apps/1')
      .expect(200)
      .query({
        filter: JSON.stringify({
          include: 'users',
          includeThrough: {
            fields: 'description',
          },
        }),
      })
      .end(function(err, res) {
        if (err) return done(err);

        expect(res.text).to.equal(JSON.stringify({
          id: 1,
          users: [
            {
              id: 1,
              userRole: {
                description: 'Can do whatever.',
                userId: 1,
              },
            },
          ],
        }));
        done();
      });
  });

  it('should include through model properties by default (findById), include filter as object', function(done) {
    request(server).get('/apps/1')
      .expect(200)
      .query({
        filter: JSON.stringify({
          include: {
            users: '',
          },
        }),
      })
      .end(function(err, res) {
        if (err) return done(err);

        expect(res.text).to.equal(JSON.stringify({
          id: 1,
          users: [
            {
              id: 1,
              userRole: {
                type: 'administrator',
                userId: 1,
              },
            },
          ],
        }));
        done();
      });
  });

  it('should include through model properties by default (findById), include filter as array', function(done) {
    request(server).get('/apps/1')
      .expect(200)
      .query({
        filter: JSON.stringify({
          include: [{
            users: '',
          }, 'users'],
        }),
      })
      .end(function(err, res) {
        if (err) return done(err);

        expect(res.text).to.equal(JSON.stringify({
          id: 1,
          users: [
            {
              id: 1,
              userRole: {
                type: 'administrator',
                userId: 1,
              },
            },
            {
              id: 1,
              userRole: {
                type: 'administrator',
                userId: 1,
              },
            },
          ],
        }));
        done();
      });
  });
});
