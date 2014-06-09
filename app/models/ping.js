var Mongo = require('mongodb');
var pingCollection = global.nss.db.collection('pings');
var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var _ = require('lodash');

class Ping{
  static create(fromId,toId, fn){

    console.log('********');
    console.log(toId);

    var ping = new Ping();
    ping.fromId = Mongo.ObjectID(fromId);
    ping.toId = Mongo.ObjectID(toId);

    pingCollection.save(ping, ()=>fn(ping));
  }

  static findByPingId(pingId, fn){

    if(pingId.length !== 24){fn(null); return;}

    pingId = Mongo.ObjectID(pingId);
    pingCollection.findOne({_id:pingId}, (e,p)=>{
      if(p){
        p = _.create(Ping.prototype, p);
        fn(p);
      }else{
        fn(null);
      }
    });
  }

  static findAllByToId(toId, fn){

    if(toId.length !== 24){
      fn(null);
      return;
    }

    toId = Mongo.ObjectID(toId);
    pingCollection.find({toId:toId}).toArray((e,pings)=>{
      User.findAll(users=>{
        pings.forEach(p=>{
          var fromUser = users.filter(u=>{
            if(p.fromId.toString() === u._id.toString()){
              return true;
            }
          });
          p.fromPic = fromUser[0].primaryPhoto;
        });
        console.log(pings);
        fn(pings);
      });
    });
  }

  destroy(fn){
    pingCollection.findAndRemove({_id:this._id}, ()=>fn());
  }
}

module.exports = Ping;
