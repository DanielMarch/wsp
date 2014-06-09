/* global ajax */
/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    getMatches();
    getPings();
    getMessageNumber();
  }

  function getMatches(){
    ajax(`/users/top3matches`, 'get', null, html=>{
      $('#topMatches').append(html);
    });
  }

  function getPings(){
    ajax(`/pings/:toId`, 'get', null, html=>{
      $('#pings').append(html);
    });
  }

  function getMessageNumber(){
    ajax(`/messages/:toId/count`, 'get', null, html=>{
      $('#messageCount').append(html);
    });
  }



})();
