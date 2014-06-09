var Mongo = require('mongodb');
var messageCollection = global.nss.db.collection('messages');
var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var _ = require('lodash');

class Message{
  static create(fromId, toId, body, fn){

    var message = new Message();
    message.fromId = Mongo.ObjectID(fromId);
    message.toId = Mongo.ObjectID(toId);
    message.message = body.message;

    messageCollection.save(message, ()=>fn(message));
  }

  static findByMessageId(messageId, fn){
    if(messageId.length !== 24){fn(null); return;}

    messageId = Mongo.ObjectID(messageId);
    messageCollection.findOne({_id:messageId}, (e,m)=>{
      if(m){
        m = _.create(Message.prototype, m);
        fn(m);
      }else{
        fn(null);
      }
    });
  }

  static findAllByToId(toId, fn){
    if(toId.length !== 24){fn(null); return;}

    toId = Mongo.ObjectID(toId);
    messageCollection.find({toId:toId}).toArray((e,messages)=>{
      User.findAll(users=>{
        messages.forEach(m=>{
          var fromUser = users.filter(u=>{
            if(m.fromId.toString() === u._id.toString()){
              return true;
            }
          });
          m.fromName = fromUser[0].name;
        });
        fn(messages);
      });
    });
  }

  destroy(fn){
    messageCollection.remove({_id:this._id}, ()=>fn());
  }
}

module.exports = Message;
