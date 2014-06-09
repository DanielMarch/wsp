/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'square-peg-test';

var expect = require('chai').expect;
//var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
//var factory = traceur.require(__dirname + '/../../helpers/factory.js');

var Ping;
var User;
var ping1, ping2;

describe('Ping', function(){
  before(function(done){
    db(function(){
      Ping = traceur.require(__dirname + '/../../../app/models/ping.js');
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('pings').drop(function(){
      global.nss.db.collection('users').drop(function(){
        User.create({email: 'tester@aol.com', password: 'a'}, function(u){
          var testerId = u._id.toString();
          Ping.create(testerId, '12345678901d342de4587453',function(p1){
            ping1 = p1;
            Ping.create(testerId, '12345678901d342de4587453',function(p2){
              ping2 = p2;
            done();
            });
          });
        });
      });
    });
  });

  describe('.create', function(){
    it('should create a ping', function(done){
      Ping.create('123443789123abcde3287453', '123443789123abcde3287445', function(p){
        expect(p).to.be.instanceof(Ping);
        expect(p._id).to.be.ok;
        done();
      });
    });
  });

  describe('.findByPingId', function(){
    it('should find the ping by Id', function(done){
      Ping.findByPingId(ping1._id.toString(), function(pings){
        expect(pings._id.toString()).to.equal(ping1._id.toString());
        done();
      });
    });

    it('should NOT find any pings - bad pingId', function(done){
      Ping.findByPingId('not an id', function(pings){
        expect(pings).to.be.null;
        done();
      });
    });

    it('should NOT find any pings - wrong pingId', function(done){
      Ping.findByPingId('538dfb6e5cc8b9f1069585b2', function(pings){
        expect(pings).to.be.null;
        done();
      });
    });
  });

  describe('.destroy', function(){
    it('should delete a ping', function(done){
      ping1.destroy(function(){
        Ping.findByPingId(ping1._id.toString(), function(pings){
          expect(pings).to.be.null;
          done();
        });
      });
    });
  });

  describe('.findAllByToId', function(){
    it('should find all pings to the user', function(done){
      Ping.findAllByToId('12345678901d342de4587453', function(pings){
        console.log(pings);
        expect(pings).to.have.length(2);
        done();
      });
    });
  });


















});
