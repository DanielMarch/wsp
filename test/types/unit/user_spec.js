/* global describe, it, before, beforeEach, afterEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'square-peg-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var factory = traceur.require(__dirname + '/../../helpers/factory.js');
var fs = require('fs');
var cp = require('child_process');


var User;

describe('User', function(){
  before(function(done){
    db(function(){
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      cp.execFile(__dirname + '/../../fixtures/cleanbefore.sh', {cwd:__dirname+'/../../fixtures'}, function(err,stdout,stderr){
        console.log(stdout);
        factory('user', function(){
          done();
        });
      });
    });
  });

  afterEach(function(done){
    cp.execFile(__dirname + '/../../fixtures/cleanafter.sh', {cwd:__dirname+'/../../../app/static/img'}, function(err,stdout,stderr){
      done();
    });
  });


  describe('.create', function(){
    it('should successfully create a user', function(done){
      User.create({email:'bob@aol.com', password:'1234'}, function(u){
        expect(u).to.be.ok;
        expect(u).to.be.an.instanceof(User);
        expect(u._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(u.password).to.have.length(60);
        done();
      });
    });

    it('should NOT successfully create a user', function(done){
      User.create({email:'terri@aol.com', password:'does not matter'}, function(u){
        expect(u).to.be.null;
        done();
      });
    });
  });

  describe('.login', function(){
    it('should successfully login a user', function(done){
      User.login({email:'terri@aol.com', password:'123'}, function(u){
        expect(u).to.be.ok;
        done();
      });
    });

    it('should NOT login user - bad email', function(done){
      User.login({email:'wrong@aol.com', password:'abcd'}, function(u){
        expect(u).to.be.null;
        done();
      });
    });

    it('should NOT login user - bad password', function(done){
      User.login({email:'terri@aol.com', password:'wrong'}, function(u){
        expect(u).to.be.null;
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should successfully find a user', function(done){
      User.findById('0123456789abcdef01234502', function(u){
        expect(u).to.be.instanceof(User);
        expect(u.email).to.equal('tammy@gmail.com');
        done();
      });
    });

    it('should NOT successfully find a user - Bad ID', function(done){
      User.findById('not an id', function(u){
        expect(u).to.be.null;
        done();
      });
    });

    it('should NOT successfully find a user - NULL', function(done){
      User.findById(null, function(u){
        expect(u).to.be.null;
        done();
      });
    });
  });

  describe('#save', function(){
    it('should successfully update a users info', function(done){
      User.findById('0123456789abcdef01234502', function(u1){
        u1.name = 'changed';
        u1.bio = 'new bio';
        u1.save(function(){
          User.findById('0123456789abcdef01234502', function(u2){
            expect(u2.name).to.equal('changed');
            expect(u2.bio).to.equal('new bio');
            expect(u2.email).to.equal('tammy@gmail.com');
            done();
          });
        });
      });
    });
  });


  describe('#update', function(){
    it('should successfully update a users info', function(done){
      var fields ={
                  name: ['tammy jones'],
                  ipAddress:['123.123.123.123'],
                  bio:['I love your dirty bits'],
                  seeking:['macbooks', 'toasters'],
                  os:['OSXXX'],
                  languages:['c++, ruby'],
                  classification:['computer'],
                };
      var files = {photo:[ {originalFilename:'mac-DELETE.jpg', path:__dirname+'/../../fixtures/copy/mac-DELETE.jpg', size:123 } ]};
      User.findById('0123456789abcdef01234502', function(user){
        user.update(fields, files);
        user.save(function(){
          expect(user).to.be.instanceof(User);
          expect(user._id).to.be.instanceof(Mongo.ObjectID);
          expect(user.name).to.equal('tammy jones');
          expect(user.primaryPhoto).to.equal('/img/0123456789abcdef01234502/mac-DELETE.jpg');
          expect(fs.existsSync(__dirname+'/../../../app/static/img/0123456789abcdef01234502/mac-DELETE.jpg')).to.be.true;
          done();
        });
      });
    });

    it('should NOT successfully update a users info', function(done){
      var files = {photo:[ {originalFilename:'mac-DELETE.jpg', path:__dirname+'/../../fixtures/copy/mac-DELETE.jpg', size:123 } ]};
      User.findById('0123456789abcdef01234502', function(user){
        user.update(null, files);
        user.save(function(){
          expect(user).to.be.instanceof(User);
          expect(user._id).to.be.instanceof(Mongo.ObjectID);
          expect(user.name).to.equal('');
          done();
        });
      });
    });

    it('should successfully make fields.seeking into a valid array', function(done){
      var fields ={
                  name: ['tammy jones'],
                  ipAddress:['123.123.123.123'],
                  bio:['I love your dirty bits'],
                  seeking:['macbooks  toasters, iPhones , cows'],
                  os:['OSX'],
                  languages:['javascript ruby'],
                  classification:['toaster'],
                };
      var files = {photo:[ {originalFilename:'mac-DELETE.jpg', path:__dirname+'/../../fixtures/copy/mac-DELETE.jpg', size:123 } ]};
      User.findById('0123456789abcdef01234503', function(user){
        user.update(fields, files);
        user.save(function(){
          expect(user).to.be.instanceof(User);
          expect(user.seeking).to.deep.equal(['macbooks', 'toasters', 'iphones', 'cows']);
          done();
        });
      });
    });

    it('should successfully make fields.seeking into a valid array', function(done){
      var fields ={
                  name: ['Ginger'],
                  ipAddress:['123.1.23.13'],
                  bio:['I love your dirty bits'],
                  seeking:['macbooks, androids , spaceships'],
                  os:['OSX'],
                  languages:['ruby'],
                  classification:['toaster'],
                };
      var files = {photo:[ {originalFilename:'mac-DELETE.jpg', path:__dirname+'/../../fixtures/copy/mac-DELETE.jpg', size:123 } ]};
      User.findById('0123456789abcdef01234504', function(user){
        user.update(fields, files);
        user.save(function(){
          expect(user).to.be.instanceof(User);
          done();
        });
      });
    });
  });

  describe('#match', function(){
    it('should successfully find matching users from a given array', function(done){
      User.findById('0123456789abcdef01234502', function(user){
        var fields ={
                    name: ['Ginger'],
                    ipAddress:['123.1.23.13'],
                    bio:['I love your dirty bits'],
                    seeking:['macbooks, androids , spaceships'],
                    os:['OSX'],
                    languages:['ruby'],
                    classification:['toaster'],
                  };
        var files = {photo:[ {originalFilename:'mac-DELETE.jpg', path:__dirname+'/../../fixtures/copy/mac-DELETE.jpg', size:123 } ]};
        User.findById('0123456789abcdef01234504', function(u2){
          u2.update(fields, files);
          u2.save(function(){
            var searchParams = ['ruby', 'mackbooks'];
            user.match(searchParams, function(matches){
              expect(matches[0]).to.be.instanceof(User);
              expect(matches[0].name).to.equal('Ginger');
              done();
            });
          });
        });
      });
    });
  }); // end describe '#match'

  describe('.destroyById', function(){
    it('should successfully delete a user', function(done){
      User.findById('0123456789abcdef01234504', function(user){
        var fields ={
                    name: ['Ginger'],
                    ipAddress:['123.1.23.13'],
                    bio:['I love your dirty bits'],
                    seeking:['macbooks, androids , spaceships'],
                    os:['OSX'],
                    languages:['ruby'],
                    classification:['toaster'],
                  };
        var files = {photo:[ {originalFilename:'mac-DELETE.jpg', path:__dirname+'/../../fixtures/copy/mac-DELETE.jpg', size:123 } ]};
        user.update(fields, files);
        user.save(function(){
          User.destroyById('0123456789abcdef01234504', function(success){
            expect(success).to.be.true;
            done();
          });
        });
      });
    });
  });


});
