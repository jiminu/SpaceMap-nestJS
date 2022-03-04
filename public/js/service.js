function cozyLog(...messages) {
  console.log('%cDEBUG', 'color:yellow;', ...messages);
}

function cozyLoading(spinner) {
  var spin = '';
  switch (spinner) {
    case 'plane':
      spin = '<div class="sk-plane"></div>';
      break;
    case 'chase':
      spin =
        '<div class="sk-chase">\n' +
        '  <div class="sk-chase-dot"></div>\n' +
        '  <div class="sk-chase-dot"></div>\n' +
        '  <div class="sk-chase-dot"></div>\n' +
        '  <div class="sk-chase-dot"></div>\n' +
        '  <div class="sk-chase-dot"></div>\n' +
        '  <div class="sk-chase-dot"></div>\n' +
        '</div>';
      break;
    case 'bounce':
      spin =
        '<div class="sk-bounce">\n' +
        '  <div class="sk-bounce-dot"></div>\n' +
        '  <div class="sk-bounce-dot"></div>\n' +
        '</div>';
      break;
    case 'wave':
      spin =
        '<div class="sk-wave">\n' +
        '  <div class="sk-wave-rect"></div>\n' +
        '  <div class="sk-wave-rect"></div>\n' +
        '  <div class="sk-wave-rect"></div>\n' +
        '  <div class="sk-wave-rect"></div>\n' +
        '  <div class="sk-wave-rect"></div>\n' +
        '</div>';
      break;
    case 'pulse':
      spin = '<div class="sk-pulse"></div>';
      break;
    case 'flow':
      spin =
        '<div class="sk-flow">\n' +
        '  <div class="sk-flow-dot"></div>\n' +
        '  <div class="sk-flow-dot"></div>\n' +
        '  <div class="sk-flow-dot"></div>\n' +
        '</div>';
      break;
    case 'swing':
      spin =
        '<div class="sk-swing">\n' +
        '  <div class="sk-swing-dot"></div>\n' +
        '  <div class="sk-swing-dot"></div>\n' +
        '</div>';
      break;
    case 'circle':
      spin =
        '<div class="sk-circle">\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '  <div class="sk-circle-dot"></div>\n' +
        '</div>';
      break;
    case 'circle-fade':
      spin =
        '<div class="sk-circle-fade">\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '  <div class="sk-circle-fade-dot"></div>\n' +
        '</div>';
      break;
    case 'grid':
      spin =
        '<div class="sk-grid">\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '  <div class="sk-grid-cube"></div>\n' +
        '</div>';
      break;
    case 'fold':
      spin =
        '<div class="sk-fold">\n' +
        '  <div class="sk-fold-cube"></div>\n' +
        '  <div class="sk-fold-cube"></div>\n' +
        '  <div class="sk-fold-cube"></div>\n' +
        '  <div class="sk-fold-cube"></div>\n' +
        '</div>';
      break;
    case 'wander':
      spin =
        '<div class="sk-wander">\n' +
        '  <div class="sk-wander-cube"></div>\n' +
        '  <div class="sk-wander-cube"></div>\n' +
        '  <div class="sk-wander-cube"></div>\n' +
        '</div>';
      break;
    default:
      spin = '<div class="sk-plane"></div>';
      break;
  }

  $('#cozyLoading')
    .css({
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
      width: '100%',
      height: $('body').height(),
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: 'rgba(124, 124, 124, 0.6)',
    })
    .append(spin);
  $('#cozyLoading > div').css({
    zIndex: 1100,
  });

  document.documentElement.style.setProperty('--sk-size', '5vw');
  document.documentElement.style.setProperty('--sk-color', 'rgba(0, 0, 255)');
}

function cozyLoadingFinish() {
  $('#cozyLoading').hide();
}

function checkAuth(target, popup, headers) {
  cozyPost({
    headers: headers,
    url: '/user/session',
    callbacks: function (data) {
      if (data.result) {
        location.href = target;
      } else {
        $.magnificPopup.open({ items: { src: popup }, type: 'inline' }, 0);
      }
    },
  });
}

function cozyAjax({ method, url, data, callbacks, headers }) {
  if (typeof callbacks === 'function') {
    callbacks['success'] = callbacks;
  }

  cozyLoading('wave');

  $.ajax({
    type: method,
    url: url,
    data: data,
    dataType: 'json',
    headers: headers,
    beforeSend: function (data) {
      if (callbacks && callbacks['beforeSend']) callbacks['beforeSend'](data);
    },
    error: function (data, status, error) {
      alert(error);
      cozyLoadingFinish();
    },
    success: function (data) {
      if (callbacks && callbacks['success']) callbacks['success'](data);
      cozyLoadingFinish();
    },
  });
}

function cozyGet({ url, data, callbacks, headers }) {
  cozyAjax({ method: 'get', url, data, callbacks, headers });
}

function cozyPost({ url, data, callbacks, headers }) {
  cozyAjax({ method: 'post', url, data, callbacks, headers });
}

function cozySetCookie(cookie_name, value, minutes) {
  var expireDate = new Date();
  expireDate.setMinutes(expireDate.getMinutes() + minutes);
  var cookie_value =
    escape(value) +
    (minutes == null ? '' : '; expires=' + expireDate.toUTCString());
  document.cookie = cookie_name + '=' + cookie_value;
}

function cozyGetCookie(cookie_name) {
  var x, y;
  var val = document.cookie.split(';');

  for (var i = 0; i < val.length; i++) {
    x = val[i].substr(0, val[i].indexOf('='));
    y = val[i].substr(val[i].indexOf('=') + 1);
    x = x.replace(/^\s+|\s+$/g, '');
    if (x === cookie_name) {
      return unescape(y);
    }
  }
}
