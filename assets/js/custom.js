
$(document).ready(function() {
  let autoOpen = true,
    playerName = $( "#playerName" ),
    endpoint = $( "#endpoint" ),
    squadName = $( "#squadName" ),
    squadSecret = $( "#squadSecret" ),
    allFields = $( [] ).add( playerName ).add( endpoint ).add( squadName ).add( squadSecret );
  if (localStorage.getItem("playerName") !== null) {
    playerName.val(localStorage.getItem('playerName'));
  }

  if (localStorage.getItem("endpoint") !== null) {
    endpoint.val(localStorage.getItem('endpoint'));
  }

  if (localStorage.getItem("squadName") !== null) {
    squadName.val(localStorage.getItem('squadName'));
  }

  if (localStorage.getItem("squadSecret") !== null) {
    squadSecret.val(localStorage.getItem('squadSecret'));
  }

  function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
      o.removeClass("is-valid");
      o.addClass( "is-invalid" );
      return false;
    } else {
      o.removeClass("is-invalid");
      o.addClass("is-valid");
      return true;
    }
  }

  function saveData() {
    let valid = true;

    valid = valid && checkLength( playerName, "playerName", 1, 100 );
    valid = valid && checkLength( endpoint, "endpoint", 6, 100 );
    valid = valid && checkLength( squadName, "squadName", 1, 100 );
    valid = valid && checkLength( squadSecret, "squadSecret", 1, 100 );
    if(valid) {
      localStorage.setItem("playerName", playerName.val());
      localStorage.setItem("endpoint", endpoint.val());
      if (localStorage.getItem("playerName") !== null) {
        playerName.val(localStorage.getItem('playerName'));
      }

      if (localStorage.getItem("endpoint") !== null) {
        endpoint.val(localStorage.getItem('endpoint'));
      }
      // Need to do rest call to endpoint here
      $.ajax({async: false, url: window.restEndpoint + '/squads', type: 'POST',
        data: JSON.stringify({'name': squadName.val(), 'secret': squadSecret.val()}),
        success: function(data, textStatus, jqXHR) {
          switch(jqXHR.status) {
            case 200:
              showNotification('top','right', 'Joined an existing Squad, enjoy your game!', 'success', 4000, false);
              break;
            case 201:
              showNotification('top','right', 'New Squad setup! Share your Squad Name and Key and get going!', 'success', 4000, false);
          }

          localStorage.setItem("squadName", $('#squadName').val());
          localStorage.setItem("squadSecret", $('#squadSecret').val());
          window.initComponentReference.zone.run(() => { window.initComponentReference.loadAngularFunction(); });
        }, error: function(jqXHR, textStatus, errorThrown) {
          switch(jqXHR.status) {
            case 409:
              // Squad exists but secret is wrong
              squadSecret.addClass( "is-invalid" );
              valid = false;
              showNotification('top','right', 'Incorrect Secret', 'danger', 4000, false);
              break;
            default:
              // Generally something wrong
              showNotification('top','right', errorThrown, 'danger', 4000, false);
              valid = false;
          }
        }});
    }
    return valid;
  }

  $( "#settingsSave" ).on( "click", function( event ) {
    event.preventDefault();
    if(saveData()) {
      $('#settingsModal').modal('hide');
    }
  });

  if(autoOpen) {
    $("#settingsModal").modal();
  }
  var showAlways = localStorage.getItem('showAlways');
  var showMyInstruments = localStorage.getItem('showMyInstruments');
  if(showAlways != null && showAlways === 'true') {
    $('#showAlways').prop('checked', true);
  } else {
    $('#showAlways').prop('checked', false);
  }

  if(showMyInstruments != null && showMyInstruments === 'true') {
    $('#showMyInstruments').prop('checked', true);
  } else {
    $('#showMyInstruments').prop('checked', false);
  }

  $('#showAlways').on('change', function() {
    var checked = $(this).is(":checked");
    if (checked) {
      localStorage.setItem('showAlways', true);
    } else {
      localStorage.setItem('showAlways', false);
    }
  });

  $('#showMyInstruments').on('change', function() {
    var checked = $(this).is(":checked");
    if (checked) {
      localStorage.setItem('showMyInstruments', true);
    } else {
      localStorage.setItem('showMyInstruments', false);
    }
  });

  const interval = setInterval(function() {
    $('.hidden-last-seen').each(function() {
      var timestamp = $(this).text();
      $(this).prev('.show-last-seen').text(timeSince(timestamp));
    });
  }, 2000);
  $.fn.sparkline.defaults.common.height = '50px';
  $.fn.sparkline.defaults.common.width = '150px';


  const navBarHeight = $('nav.navbar').height();
  const instrumentsHeight = $('div#instruments-div').height();
  const cardHeaderHeight = $('.card-header').height();
  const totalHeight = navBarHeight + instrumentsHeight + cardHeaderHeight + 25;
  const windowHeight = $(window).height();
  const resizableHeight = windowHeight - totalHeight;
  $('.resizable-div').each(function() {
    $(this).height(resizableHeight + 'px');
  });
});


function timeSince(timeStamp) {
  var now = new Date(),
  secondsPast = (now.getTime() - timeStamp) / 1000;
  return parseInt(secondsPast) + 's ago';
}

function showNotification(from, align, message, type, timer, allow_dismiss){
  $.notify({
    message: message
  },{
    type: type,
    timer: timer,
    placement: {
      from: from,
      align: align
    },
    allow_dismiss: allow_dismiss
  });
}

function isSiteOnline(callback) {
  const url = localStorage.getItem('endpoint') || 'http://localhost:8111';
  // try to load favicon
  var timer = setTimeout(function(){
    // timeout after 5 seconds
    callback(false);
  },5000)

  var img = document.createElement("img");
  img.onload = function() {
    clearTimeout(timer);
    callback(true);
  }

  img.onerror = function() {
    clearTimeout(timer);
    callback(false);
  }

  img.src = url+'/map.img?gen=' + Math.random();
}