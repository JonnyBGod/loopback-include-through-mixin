'use strict';

var loopback = require('loopback');
var IncludeThrough = require('../include-through.js');
var expect  = require('chai').expect;
var request = require('supertest');
var app = loopback();

app.set('legacyExplorer', false);
app.set('remoting', {
  context: false,
  cors: false,
});
app.use(loopback.rest());

//WIP more tests
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

  User = app.model('user', {
    dataSource: 'db',
  });

  App = app.model('app', {
    dataSource: 'db',
  });

  UserRole = app.model('userRole', {
    type: String,
    description: String,
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
      'users',
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
            userId: 1,
            type: 'administrator',
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
            userId: 1,
            description: 'Can do whatever.',
          },
        }]));
        done();
      });
  });
});
