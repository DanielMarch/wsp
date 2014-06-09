'use strict';

exports.index = (req, res)=>{
  if(!req.session.userId){
    res.render('home/index', {user: res.locals.user, title: 'SquarePeg: Home'});
  }
  else{
    res.redirect('/users/dash');
  }
};
