'use strict';

var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/base.js');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var rimraf = require('rimraf');

class User {

  static create(obj, fn){
    users.findOne({email:obj.email}, (err,user)=>{
      if(user) {
        fn(null);
      } else {
        user = new User();
        user._id = Mongo.ObjectID(obj._id);
        user.name = '';
        user.email = obj.email;
        user.password = bcrypt.hashSync(obj.password, 8);
        user.isCreated = false;
        user.ipAddress = '';
        user.primaryPhoto = '/img/assets/defaultPhoto.png';
        user.primaryPhotoPath = null;
        user.primaryPhotoDir = null;
        user.photoGallery = [];
        user.bio = '';
        user.seeking = [];
        user.languages = [];
        user.os = '';
        user.classification = '';
        users.save(user, ()=>fn(user));
      }
    });
  }

  static login(obj, fn){
    users.findOne({email:obj.email}, (e,u)=>{
      if(u){
        var isMatch = bcrypt.compareSync(obj.password, u.password);
        if(isMatch){
          fn(u);
        }else{
          fn(null);
        }
      }else{
        fn(null);
      }
    });
  }

  static findAll(fn) {
    Base.findAll(users, User, fn);
  }

  static findById(id, fn){
    Base.findById(id, users, User, fn);
  }


  static destroyById(userId, fn) {
    userId = Mongo.ObjectID(userId);
    users.findAndRemove({_id:userId}, (e,u)=>{
      rimraf(u.primaryPhotoDir, ()=> {
        fn(true);
      });
    });
  }

  save(fn) {
    users.save(this, ()=>fn());
  }

  update(fields, files){
    if(fields && typeof(fields.name) !== 'undefined') {
      if(!this.isCreated) {
        this.isCreated = true;
      }
      this.name = fields.name[0];
      this.ipAddress = fields.ipAddress[0].toString();
      this.ipAddress = this.ipAddress.match(/[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/g,''); // check if valid IP address
      if(this.ipAddress === null){ this.ipAddress = '000.000.000.000'; }
      else { this.ipAddress = this.ipAddress.toString(); }
      this.bio = fields.bio[0];
      this.seeking = fields.seeking[0].toLowerCase().replace(/,/g,' ').split(' ').filter(Boolean);
      this.languages = fields.languages[0].toLowerCase().replace(/,/g,' ').split(' ').filter(Boolean);
      this.os = fields.os[0];
      this.classification = fields.classification[0].toLowerCase();
      if(files.photo[0].size !== 0){
        this.primaryPhoto = `/img/${this._id.toString()}/${files.photo[0].originalFilename}`;
        var userDir = `${__dirname}/../static/img/${this._id.toString()}`;
        userDir = path.normalize(userDir);
        this.primaryPhotoPath = `${userDir}/${files.photo[0].originalFilename}`;
        this.primaryPhotoDir = userDir;
        if(!fs.existsSync(userDir)){
          fs.mkdirSync(userDir);
        }
        fs.renameSync(files.photo[0].path, this.primaryPhotoPath);
      }
    }
  }

  match(searchParams, fn) {
    if(searchParams) {
      var tmp = [];
      searchParams.forEach(sp=>{
        if(sp.match(/[a-z]+s$/g)!==null) {
          tmp.push(sp.slice(0,-1)); // strips off 's'
        }
        searchParams = searchParams.concat(tmp);
      });
      users.find({ $or: [ { classification: { $in: searchParams} },
                          { languages: { $in:searchParams } },
                          { os: { $in: searchParams } } ] } ).toArray((err, matches)=>{
                  matches = matches.map(m=>_.create(User.prototype, m));
                  matches = matches.filter(m=>this._id.toString()!==m._id.toString());
                  fn(matches);
      });
    }
    else {
      fn(null);
    }
  }

  search(searchParams, fn) {
    searchParams = searchParams.toLowerCase().replace(/,/g,' ').split(' ').filter(Boolean);
    this.match(searchParams, matches=>fn(matches));
  }

} // end class

module.exports = User;


//{ $or: [ { classification: { $in: ['ruby', 'mackbooks'] } },{ languages: { $in:['ruby', 'mackbooks'] } },{ os: { $in: ['ruby', 'mackbooks'] } } ] }
