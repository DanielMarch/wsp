'use strict';

var _ = require('lodash');
var traceur = require('traceur');
var Message = traceur.require(__dirname + '/../models/message.js');

exports.index = (req, res)=>{
  Message.findAllByToId(req.session.userId, messages=>{
    res.render('messages/index', {messages: messages, title: 'Inbox'});
  });
};

exports.new = (req, res)=>{
  res.render('messages/new', {toId: req.params.toId, title: 'Create New Message'});
};

exports.create = (req, res)=>{
  Message.create(req.session.userId, req.params.toId, req.body, message=>{
    console.log(message);
    res.redirect('/users/dash');
  });
};

exports.destroy = (req, res)=>{
  Message.findByMessageId(req.params.msgId, message=>{
    message = _.create(Message.prototype, message);
    message.destroy(()=>res.redirect('/messages/inbox'));
  });
};

exports.count = (req, res)=>{
  Message.findAllByToId(req.session.userId, messages=>{
    res.render('messages/count', {messages:messages, title:'Message Total'});
  });
};
