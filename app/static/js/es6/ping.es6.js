/* jshint unused: false */
// global functions
/* global ajax */



(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    //alert('loaded');
    $('#ping').click(ping);
    $('body').on('click', 'a.pingclose', deletePing);
  }

  function deletePing(){
    debugger;
    $(this).closest('form').submit();
  }

  function ping(){
    var toId = $('#user').attr('data-id');

    ajax(`/pings/new/${toId}`, 'post', null, html=>{
      console.log(html);
      $('#ping').addClass('pinged');
    }, 'json');

  }

})();
