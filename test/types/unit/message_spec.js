/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'square-peg-test';

var expect = require('chai').expect;
//var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
//var factory = traceur.require(__dirname + '/../../helpers/factory.js');

var Message;
var User;
var message1, message2;

describe('Message', function(){
  before(function(done){
    db(function(){
      Message = traceur.require(__dirname + '/../../../app/models/message.js');
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('messages').drop(function(){
      global.nss.db.collection('users').drop(function(){
        User.create({email: 'tester@aol.com', password: 'a'}, function(u){
          var testerId = u._id.toString();
          Message.create(testerId, '12345678901d342de4587453', {message:'Hey, I like your logic board.'}, function(m1){
            message1 = m1;
            Message.create(testerId, '123443789012abcde3285555', {message:'Nice to meet you. Lets have computer sex'},function(m2){
              message2 = m2;
              done();
            });
          });
        });
      });
    });
  });

  describe('.create', function(){
    it('should create a message', function(done){
      Message.create('123443789123abcde3287453', '123443789123abcde3287445', {'message':'This is a test message.'}, function(m){
        expect(m).to.be.instanceof(Message);
        expect(m._id).to.be.ok;
        expect(m.message).to.be.a('string');
        done();
      });
    });
  });

  describe('.findByMessageId', function(){
    it('should find the message by Id', function(done){
      Message.findByMessageId(message1._id.toString(), function(messages){
        expect(messages._id.toString()).to.equal(message1._id.toString());
        done();
      });
    });

    it('should NOT find any messages - bad messageId', function(done){
      Message.findByMessageId('not an id', function(messages){
        expect(messages).to.be.null;
        done();
      });
    });

    it('should NOT find any messages - wrong messageId', function(done){
      Message.findByMessageId('538dfb6e5cc8b9f1069585b2', function(messages){
        expect(messages).to.be.null;
        done();
      });
    });
  });

  describe('.destroy', function(){
    it('should delete a message', function(done){
      message1.destroy(function(){
        Message.findByMessageId(message1._id.toString(), function(messages){
          expect(messages).to.be.null;
          done();
        });
      });
    });
  });

  describe('.findAllByToId', function(){
    it('should find all messages to the user', function(done){
      Message.findAllByToId('12345678901d342de4587453', function(messages){
        console.log(messages);
        expect(messages).to.have.length(1);
        done();
      });
    });
  });


















});
