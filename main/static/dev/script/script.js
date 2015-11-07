(function() {
  window.api_call = function(method, url, params, data, callback) {
    var k, separator, v;
    callback = callback || data || params;
    data = data || params;
    if (arguments.length === 4) {
      data = void 0;
    }
    if (arguments.length === 3) {
      params = void 0;
      data = void 0;
    }
    params = params || {};
    for (k in params) {
      v = params[k];
      if (v == null) {
        delete params[k];
      }
    }
    separator = url.search('\\?') >= 0 ? '&' : '?';
    return $.ajax({
      type: method,
      url: "" + url + separator + ($.param(params)),
      contentType: 'application/json',
      accepts: 'application/json',
      dataType: 'json',
      data: data ? JSON.stringify(data) : void 0,
      success: function(data) {
        var more;
        if (data.status === 'success') {
          more = void 0;
          if (data.next_url) {
            more = function(callback) {
              return api_call(method, data.next_url, {}, callback);
            };
          }
          return typeof callback === "function" ? callback(void 0, data.result, more) : void 0;
        } else {
          return typeof callback === "function" ? callback(data) : void 0;
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        var e, error, error1;
        error = {
          error_code: 'ajax_error',
          text_status: textStatus,
          error_thrown: errorThrown,
          jqXHR: jqXHR
        };
        try {
          if (jqXHR.responseText) {
            error = $.parseJSON(jqXHR.responseText);
          }
        } catch (error1) {
          e = error1;
          error = error;
        }
        LOG('api_call error', error);
        return typeof callback === "function" ? callback(error) : void 0;
      }
    });
  };

}).call(this);

(function() {
  window.LOG = function() {
    return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, arguments) : void 0 : void 0;
  };

  window.init_common = function() {
    init_loading_button();
    init_password_show_button();
    init_time();
    init_announcement();
    return init_row_link();
  };

  window.init_loading_button = function() {
    return $('body').on('click', '.btn-loading', function() {
      return $(this).button('loading');
    });
  };

  window.init_password_show_button = function() {
    return $('body').on('click', '.btn-password-show', function() {
      var $target;
      $target = $($(this).data('target'));
      $target.focus();
      if ($(this).hasClass('active')) {
        return $target.attr('type', 'password');
      } else {
        return $target.attr('type', 'text');
      }
    });
  };

  window.init_time = function() {
    var recalculate;
    if ($('time').length > 0) {
      recalculate = function() {
        $('time[datetime]').each(function() {
          var date, diff;
          date = moment.utc($(this).attr('datetime'));
          diff = moment().diff(date, 'days');
          if (diff > 25) {
            $(this).text(date.local().format('YYYY-MM-DD'));
          } else {
            $(this).text(date.fromNow());
          }
          return $(this).attr('title', date.local().format('dddd, MMMM Do YYYY, HH:mm:ss Z'));
        });
        return setTimeout(arguments.callee, 1000 * 45);
      };
      return recalculate();
    }
  };

  window.init_announcement = function() {
    $('.alert-announcement button.close').click(function() {
      return typeof sessionStorage !== "undefined" && sessionStorage !== null ? sessionStorage.setItem('closedAnnouncement', $('.alert-announcement').html()) : void 0;
    });
    if ((typeof sessionStorage !== "undefined" && sessionStorage !== null ? sessionStorage.getItem('closedAnnouncement') : void 0) !== $('.alert-announcement').html()) {
      return $('.alert-announcement').show();
    }
  };

  window.init_row_link = function() {
    $('body').on('click', '.row-link', function() {
      return window.location.href = $(this).data('href');
    });
    return $('body').on('click', '.not-link', function(e) {
      return e.stopPropagation();
    });
  };

  window.clear_notifications = function() {
    return $('#notifications').empty();
  };

  window.show_notification = function(message, category) {
    if (category == null) {
      category = 'warning';
    }
    clear_notifications();
    if (!message) {
      return;
    }
    return $('#notifications').append("<div class=\"alert alert-dismissable alert-" + category + "\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>\n  " + message + "\n</div>");
  };

}).call(this);

(function() {
  window.init_admin_config = function() {};

}).call(this);

(function() {
  $(function() {
    return init_common();
  });

  $(function() {
    return $('html.welcome').each(function() {
      return LOG('init welcome');
    });
  });

  $(function() {
    return $('html.auth').each(function() {
      return init_auth();
    });
  });

  $(function() {
    return $('html.feedback').each(function() {});
  });

  $(function() {
    return $('html.user-list').each(function() {
      return init_user_list();
    });
  });

  $(function() {
    return $('html.user-merge').each(function() {
      return init_user_merge();
    });
  });

  $(function() {
    return $('html.admin-config').each(function() {
      return init_admin_config();
    });
  });

}).call(this);

(function() {
  window.init_auth = function() {
    $('.remember').change(function() {
      var button, buttons, href, i, len, results;
      buttons = $('.btn-social').toArray().concat($('.btn-social-icon').toArray());
      results = [];
      for (i = 0, len = buttons.length; i < len; i++) {
        button = buttons[i];
        href = $(button).prop('href');
        if ($('.remember input').is(':checked')) {
          $(button).prop('href', href + "&remember=true");
          results.push($('#remember').prop('checked', true));
        } else {
          $(button).prop('href', href.replace('&remember=true', ''));
          results.push($('#remember').prop('checked', false));
        }
      }
      return results;
    });
    return $('.remember').change();
  };

}).call(this);

(function() {
  var init_user_delete_btn, init_user_merge_btn, init_user_selections, select_default_user, update_user_selections, user_select_row;

  window.init_user_list = function() {
    init_user_selections();
    init_user_delete_btn();
    return init_user_merge_btn();
  };

  init_user_selections = function() {
    $('input[name=user_db]').each(function() {
      return user_select_row($(this));
    });
    $('#select-all').change(function() {
      $('input[name=user_db]').prop('checked', $(this).is(':checked'));
      return $('input[name=user_db]').each(function() {
        return user_select_row($(this));
      });
    });
    return $('input[name=user_db]').change(function() {
      return user_select_row($(this));
    });
  };

  user_select_row = function($element) {
    update_user_selections();
    return $('input[name=user_db]').each(function() {
      var id;
      id = $element.val();
      return $("#" + id).toggleClass('warning', $element.is(':checked'));
    });
  };

  update_user_selections = function() {
    var selected;
    selected = $('input[name=user_db]:checked').length;
    $('#user-actions').toggleClass('hidden', selected === 0);
    $('#user-merge').toggleClass('hidden', selected < 2);
    if (selected === 0) {
      $('#select-all').prop('indeterminate', false);
      return $('#select-all').prop('checked', false);
    } else if ($('input[name=user_db]:not(:checked)').length === 0) {
      $('#select-all').prop('indeterminate', false);
      return $('#select-all').prop('checked', true);
    } else {
      return $('#select-all').prop('indeterminate', true);
    }
  };

  init_user_delete_btn = function() {
    return $('#user-delete').click(function(e) {
      var confirm_message, delete_url, error_message, success_message, user_keys;
      clear_notifications();
      e.preventDefault();
      confirm_message = ($(this).data('confirm')).replace('{users}', $('input[name=user_db]:checked').length);
      if (confirm(confirm_message)) {
        user_keys = [];
        $('input[name=user_db]:checked').each(function() {
          $(this).attr('disabled', true);
          return user_keys.push($(this).val());
        });
        delete_url = $(this).data('api-url');
        success_message = $(this).data('success');
        error_message = $(this).data('error');
        return api_call('DELETE', delete_url, {
          user_keys: user_keys.join(',')
        }, function(err, result) {
          if (err) {
            $('input[name=user_db]:disabled').removeAttr('disabled');
            show_notification(error_message.replace('{users}', user_keys.length), 'danger');
            return;
          }
          return $("#" + (result.join(', #'))).fadeOut(function() {
            $(this).remove();
            update_user_selections();
            return show_notification(success_message.replace('{users}', user_keys.length), 'success');
          });
        });
      }
    });
  };

  window.init_user_merge = function() {
    var api_url, user_keys;
    user_keys = $('#user_keys').val();
    api_url = $('.api-url').data('api-url');
    api_call('GET', api_url, {
      user_keys: user_keys
    }, function(error, result) {
      if (error) {
        LOG('Something went terribly wrong');
        return;
      }
      window.user_dbs = result;
      return $('input[name=user_db]').removeAttr('disabled');
    });
    return $('input[name=user_db]').change(function(event) {
      var user_key;
      user_key = $(event.currentTarget).val();
      return select_default_user(user_key);
    });
  };

  select_default_user = function(user_key) {
    var i, len, results, user_db;
    $('.user-row').removeClass('success').addClass('danger');
    $("#" + user_key).removeClass('danger').addClass('success');
    results = [];
    for (i = 0, len = user_dbs.length; i < len; i++) {
      user_db = user_dbs[i];
      if (user_key === user_db.key) {
        $('input[name=user_key]').val(user_db.key);
        $('input[name=username]').val(user_db.username);
        $('input[name=name]').val(user_db.name);
        $('input[name=email]').val(user_db.email);
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  init_user_merge_btn = function() {
    return $('#user-merge').click(function(e) {
      var user_keys, user_merge_url;
      e.preventDefault();
      user_keys = [];
      $('input[name=user_db]:checked').each(function() {
        return user_keys.push($(this).val());
      });
      user_merge_url = $(this).data('user-merge-url');
      return window.location.href = user_merge_url + "?user_keys=" + (user_keys.join(','));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9hcGkuY29mZmVlIiwiY29tbW9uL3V0aWwuY29mZmVlIiwic2l0ZS9hZG1pbi5jb2ZmZWUiLCJzaXRlL2FwcC5jb2ZmZWUiLCJzaXRlL2F1dGguY29mZmVlIiwic2l0ZS91c2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxNQUFkLEVBQXNCLElBQXRCLEVBQTRCLFFBQTVCO0FBQ2hCLFFBQUE7SUFBQSxRQUFBLEdBQVcsUUFBQSxJQUFZLElBQVosSUFBb0I7SUFDL0IsSUFBQSxHQUFPLElBQUEsSUFBUTtJQUNmLElBQUcsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBdkI7TUFDRSxJQUFBLEdBQU8sT0FEVDs7SUFFQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEtBQXFCLENBQXhCO01BQ0UsTUFBQSxHQUFTO01BQ1QsSUFBQSxHQUFPLE9BRlQ7O0lBR0EsTUFBQSxHQUFTLE1BQUEsSUFBVTtBQUNuQixTQUFBLFdBQUE7O01BQ0UsSUFBd0IsU0FBeEI7UUFBQSxPQUFPLE1BQU8sQ0FBQSxDQUFBLEVBQWQ7O0FBREY7SUFFQSxTQUFBLEdBQWUsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFYLENBQUEsSUFBcUIsQ0FBeEIsR0FBK0IsR0FBL0IsR0FBd0M7V0FDcEQsQ0FBQyxDQUFDLElBQUYsQ0FDRTtNQUFBLElBQUEsRUFBTSxNQUFOO01BQ0EsR0FBQSxFQUFLLEVBQUEsR0FBRyxHQUFILEdBQVMsU0FBVCxHQUFvQixDQUFDLENBQUMsQ0FBQyxLQUFGLENBQVEsTUFBUixDQUFELENBRHpCO01BRUEsV0FBQSxFQUFhLGtCQUZiO01BR0EsT0FBQSxFQUFTLGtCQUhUO01BSUEsUUFBQSxFQUFVLE1BSlY7TUFLQSxJQUFBLEVBQVMsSUFBSCxHQUFhLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixDQUFiLEdBQXVDLE1BTDdDO01BTUEsT0FBQSxFQUFT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QixDQUFDLEdBQTFCLENBQThCLE9BQU8sQ0FBQyxRQUF0QztRQUNBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLEdBQXRCLENBQTBCLE9BQU8sQ0FBQyxJQUFsQztRQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLEdBQXZCLENBQTJCLE9BQU8sQ0FBQyxLQUFuQztBQUNBLGNBTEY7T0FBQSxNQUFBOzZCQUFBOztBQURGOztFQUpvQjs7RUFhdEIsbUJBQUEsR0FBc0IsU0FBQTtXQUNwQixDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLEtBQWpCLENBQXVCLFNBQUMsQ0FBRDtBQUNyQixVQUFBO01BQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtNQUNBLFNBQUEsR0FBWTtNQUNaLENBQUEsQ0FBRSw2QkFBRixDQUFnQyxDQUFDLElBQWpDLENBQXNDLFNBQUE7ZUFDcEMsU0FBUyxDQUFDLElBQVYsQ0FBZSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsR0FBUixDQUFBLENBQWY7TUFEb0MsQ0FBdEM7TUFFQSxjQUFBLEdBQWlCLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsZ0JBQWI7YUFDakIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFoQixHQUEwQixjQUFELEdBQWdCLGFBQWhCLEdBQTRCLENBQUMsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFmLENBQUQ7SUFOaEMsQ0FBdkI7RUFEb0I7QUFsR3RCIiwiZmlsZSI6InNjcmlwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5hcGlfY2FsbCA9IChtZXRob2QsIHVybCwgcGFyYW1zLCBkYXRhLCBjYWxsYmFjaykgLT5cbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBkYXRhIHx8IHBhcmFtc1xuICBkYXRhID0gZGF0YSB8fCBwYXJhbXNcbiAgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSA0XG4gICAgZGF0YSA9IHVuZGVmaW5lZFxuICBpZiBhcmd1bWVudHMubGVuZ3RoID09ICAzXG4gICAgcGFyYW1zID0gdW5kZWZpbmVkXG4gICAgZGF0YSA9IHVuZGVmaW5lZFxuICBwYXJhbXMgPSBwYXJhbXMgfHwge31cbiAgZm9yIGssIHYgb2YgcGFyYW1zXG4gICAgZGVsZXRlIHBhcmFtc1trXSBpZiBub3Qgdj9cbiAgc2VwYXJhdG9yID0gaWYgdXJsLnNlYXJjaCgnXFxcXD8nKSA+PSAwIHRoZW4gJyYnIGVsc2UgJz8nXG4gICQuYWpheFxuICAgIHR5cGU6IG1ldGhvZFxuICAgIHVybDogXCIje3VybH0je3NlcGFyYXRvcn0jeyQucGFyYW0gcGFyYW1zfVwiXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIGFjY2VwdHM6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBkYXRhOiBpZiBkYXRhIHRoZW4gSlNPTi5zdHJpbmdpZnkoZGF0YSkgZWxzZSB1bmRlZmluZWRcbiAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEuc3RhdHVzID09ICdzdWNjZXNzJ1xuICAgICAgICBtb3JlID0gdW5kZWZpbmVkXG4gICAgICAgIGlmIGRhdGEubmV4dF91cmxcbiAgICAgICAgICBtb3JlID0gKGNhbGxiYWNrKSAtPiBhcGlfY2FsbChtZXRob2QsIGRhdGEubmV4dF91cmwsIHt9LCBjYWxsYmFjaylcbiAgICAgICAgY2FsbGJhY2s/IHVuZGVmaW5lZCwgZGF0YS5yZXN1bHQsIG1vcmVcbiAgICAgIGVsc2VcbiAgICAgICAgY2FsbGJhY2s/IGRhdGFcbiAgICBlcnJvcjogKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikgLT5cbiAgICAgIGVycm9yID1cbiAgICAgICAgZXJyb3JfY29kZTogJ2FqYXhfZXJyb3InXG4gICAgICAgIHRleHRfc3RhdHVzOiB0ZXh0U3RhdHVzXG4gICAgICAgIGVycm9yX3Rocm93bjogZXJyb3JUaHJvd25cbiAgICAgICAganFYSFI6IGpxWEhSXG4gICAgICB0cnlcbiAgICAgICAgZXJyb3IgPSAkLnBhcnNlSlNPTihqcVhIUi5yZXNwb25zZVRleHQpIGlmIGpxWEhSLnJlc3BvbnNlVGV4dFxuICAgICAgY2F0Y2ggZVxuICAgICAgICBlcnJvciA9IGVycm9yXG4gICAgICBMT0cgJ2FwaV9jYWxsIGVycm9yJywgZXJyb3JcbiAgICAgIGNhbGxiYWNrPyBlcnJvclxuIiwid2luZG93LkxPRyA9IC0+XG4gIGNvbnNvbGU/LmxvZz8gYXJndW1lbnRzLi4uXG5cblxud2luZG93LmluaXRfY29tbW9uID0gLT5cbiAgaW5pdF9sb2FkaW5nX2J1dHRvbigpXG4gIGluaXRfcGFzc3dvcmRfc2hvd19idXR0b24oKVxuICBpbml0X3RpbWUoKVxuICBpbml0X2Fubm91bmNlbWVudCgpXG4gIGluaXRfcm93X2xpbmsoKVxuXG5cbndpbmRvdy5pbml0X2xvYWRpbmdfYnV0dG9uID0gLT5cbiAgJCgnYm9keScpLm9uICdjbGljaycsICcuYnRuLWxvYWRpbmcnLCAtPlxuICAgICQodGhpcykuYnV0dG9uICdsb2FkaW5nJ1xuXG5cbndpbmRvdy5pbml0X3Bhc3N3b3JkX3Nob3dfYnV0dG9uID0gLT5cbiAgJCgnYm9keScpLm9uICdjbGljaycsICcuYnRuLXBhc3N3b3JkLXNob3cnLCAtPlxuICAgICR0YXJnZXQgPSAkKCQodGhpcykuZGF0YSAndGFyZ2V0JylcbiAgICAkdGFyZ2V0LmZvY3VzKClcbiAgICBpZiAkKHRoaXMpLmhhc0NsYXNzICdhY3RpdmUnXG4gICAgICAkdGFyZ2V0LmF0dHIgJ3R5cGUnLCAncGFzc3dvcmQnXG4gICAgZWxzZVxuICAgICAgJHRhcmdldC5hdHRyICd0eXBlJywgJ3RleHQnXG5cblxud2luZG93LmluaXRfdGltZSA9IC0+XG4gIGlmICQoJ3RpbWUnKS5sZW5ndGggPiAwXG4gICAgcmVjYWxjdWxhdGUgPSAtPlxuICAgICAgJCgndGltZVtkYXRldGltZV0nKS5lYWNoIC0+XG4gICAgICAgIGRhdGUgPSBtb21lbnQudXRjICQodGhpcykuYXR0ciAnZGF0ZXRpbWUnXG4gICAgICAgIGRpZmYgPSBtb21lbnQoKS5kaWZmIGRhdGUgLCAnZGF5cydcbiAgICAgICAgaWYgZGlmZiA+IDI1XG4gICAgICAgICAgJCh0aGlzKS50ZXh0IGRhdGUubG9jYWwoKS5mb3JtYXQgJ1lZWVktTU0tREQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAkKHRoaXMpLnRleHQgZGF0ZS5mcm9tTm93KClcbiAgICAgICAgJCh0aGlzKS5hdHRyICd0aXRsZScsIGRhdGUubG9jYWwoKS5mb3JtYXQgJ2RkZGQsIE1NTU0gRG8gWVlZWSwgSEg6bW06c3MgWidcbiAgICAgIHNldFRpbWVvdXQgYXJndW1lbnRzLmNhbGxlZSwgMTAwMCAqIDQ1XG4gICAgcmVjYWxjdWxhdGUoKVxuXG5cbndpbmRvdy5pbml0X2Fubm91bmNlbWVudCA9IC0+XG4gICQoJy5hbGVydC1hbm5vdW5jZW1lbnQgYnV0dG9uLmNsb3NlJykuY2xpY2sgLT5cbiAgICBzZXNzaW9uU3RvcmFnZT8uc2V0SXRlbSAnY2xvc2VkQW5ub3VuY2VtZW50JywgJCgnLmFsZXJ0LWFubm91bmNlbWVudCcpLmh0bWwoKVxuXG4gIGlmIHNlc3Npb25TdG9yYWdlPy5nZXRJdGVtKCdjbG9zZWRBbm5vdW5jZW1lbnQnKSAhPSAkKCcuYWxlcnQtYW5ub3VuY2VtZW50JykuaHRtbCgpXG4gICAgJCgnLmFsZXJ0LWFubm91bmNlbWVudCcpLnNob3coKVxuXG5cbndpbmRvdy5pbml0X3Jvd19saW5rID0gLT5cbiAgJCgnYm9keScpLm9uICdjbGljaycsICcucm93LWxpbmsnLCAtPlxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJCh0aGlzKS5kYXRhICdocmVmJ1xuXG4gICQoJ2JvZHknKS5vbiAnY2xpY2snLCAnLm5vdC1saW5rJywgKGUpIC0+XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cbndpbmRvdy5jbGVhcl9ub3RpZmljYXRpb25zID0gLT5cbiAgJCgnI25vdGlmaWNhdGlvbnMnKS5lbXB0eSgpXG5cblxud2luZG93LnNob3dfbm90aWZpY2F0aW9uID0gKG1lc3NhZ2UsIGNhdGVnb3J5PSd3YXJuaW5nJykgLT5cbiAgY2xlYXJfbm90aWZpY2F0aW9ucygpXG4gIHJldHVybiBpZiBub3QgbWVzc2FnZVxuXG4gICQoJyNub3RpZmljYXRpb25zJykuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRpc21pc3NhYmxlIGFsZXJ0LSN7Y2F0ZWdvcnl9XCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L2J1dHRvbj5cbiAgICAgICAgI3ttZXNzYWdlfVxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4iLCJ3aW5kb3cuaW5pdF9hZG1pbl9jb25maWcgPSAtPlxuICAjIGRvIHNvbWV0aGluZyB3aXRoIHRoZSBhZG1pbiBwYWdlIGhlcmVcbiIsIiQgLT5cbiAgaW5pdF9jb21tb24oKVxuXG4kIC0+ICQoJ2h0bWwud2VsY29tZScpLmVhY2ggLT5cbiAgTE9HKCdpbml0IHdlbGNvbWUnKVxuXG4kIC0+ICQoJ2h0bWwuYXV0aCcpLmVhY2ggLT5cbiAgaW5pdF9hdXRoKClcblxuJCAtPiAkKCdodG1sLmZlZWRiYWNrJykuZWFjaCAtPlxuXG4kIC0+ICQoJ2h0bWwudXNlci1saXN0JykuZWFjaCAtPlxuICBpbml0X3VzZXJfbGlzdCgpXG5cbiQgLT4gJCgnaHRtbC51c2VyLW1lcmdlJykuZWFjaCAtPlxuICBpbml0X3VzZXJfbWVyZ2UoKVxuXG4kIC0+ICQoJ2h0bWwuYWRtaW4tY29uZmlnJykuZWFjaCAtPlxuICBpbml0X2FkbWluX2NvbmZpZygpXG4iLCJ3aW5kb3cuaW5pdF9hdXRoID0gLT5cbiAgJCgnLnJlbWVtYmVyJykuY2hhbmdlIC0+XG4gICAgYnV0dG9ucyA9ICQoJy5idG4tc29jaWFsJykudG9BcnJheSgpLmNvbmNhdCAkKCcuYnRuLXNvY2lhbC1pY29uJykudG9BcnJheSgpXG4gICAgZm9yIGJ1dHRvbiBpbiBidXR0b25zXG4gICAgICBocmVmID0gJChidXR0b24pLnByb3AgJ2hyZWYnXG4gICAgICBpZiAkKCcucmVtZW1iZXIgaW5wdXQnKS5pcyAnOmNoZWNrZWQnXG4gICAgICAgICQoYnV0dG9uKS5wcm9wICdocmVmJywgXCIje2hyZWZ9JnJlbWVtYmVyPXRydWVcIlxuICAgICAgICAkKCcjcmVtZW1iZXInKS5wcm9wICdjaGVja2VkJywgdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICAkKGJ1dHRvbikucHJvcCAnaHJlZicsIGhyZWYucmVwbGFjZSgnJnJlbWVtYmVyPXRydWUnLCAnJylcbiAgICAgICAgJCgnI3JlbWVtYmVyJykucHJvcCAnY2hlY2tlZCcsIGZhbHNlXG5cbiAgJCgnLnJlbWVtYmVyJykuY2hhbmdlKClcbiIsIndpbmRvdy5pbml0X3VzZXJfbGlzdCA9IC0+XG4gIGluaXRfdXNlcl9zZWxlY3Rpb25zKClcbiAgaW5pdF91c2VyX2RlbGV0ZV9idG4oKVxuICBpbml0X3VzZXJfbWVyZ2VfYnRuKClcblxuXG5pbml0X3VzZXJfc2VsZWN0aW9ucyA9IC0+XG4gICQoJ2lucHV0W25hbWU9dXNlcl9kYl0nKS5lYWNoIC0+XG4gICAgdXNlcl9zZWxlY3Rfcm93ICQodGhpcylcblxuICAkKCcjc2VsZWN0LWFsbCcpLmNoYW5nZSAtPlxuICAgICQoJ2lucHV0W25hbWU9dXNlcl9kYl0nKS5wcm9wICdjaGVja2VkJywgJCh0aGlzKS5pcyAnOmNoZWNrZWQnXG4gICAgJCgnaW5wdXRbbmFtZT11c2VyX2RiXScpLmVhY2ggLT5cbiAgICAgIHVzZXJfc2VsZWN0X3JvdyAkKHRoaXMpXG5cbiAgJCgnaW5wdXRbbmFtZT11c2VyX2RiXScpLmNoYW5nZSAtPlxuICAgIHVzZXJfc2VsZWN0X3JvdyAkKHRoaXMpXG5cblxudXNlcl9zZWxlY3Rfcm93ID0gKCRlbGVtZW50KSAtPlxuICB1cGRhdGVfdXNlcl9zZWxlY3Rpb25zKClcbiAgJCgnaW5wdXRbbmFtZT11c2VyX2RiXScpLmVhY2ggLT5cbiAgICBpZCA9ICRlbGVtZW50LnZhbCgpXG4gICAgJChcIiMje2lkfVwiKS50b2dnbGVDbGFzcyAnd2FybmluZycsICRlbGVtZW50LmlzICc6Y2hlY2tlZCdcblxuXG51cGRhdGVfdXNlcl9zZWxlY3Rpb25zID0gLT5cbiAgc2VsZWN0ZWQgPSAkKCdpbnB1dFtuYW1lPXVzZXJfZGJdOmNoZWNrZWQnKS5sZW5ndGhcbiAgJCgnI3VzZXItYWN0aW9ucycpLnRvZ2dsZUNsYXNzICdoaWRkZW4nLCBzZWxlY3RlZCA9PSAwXG4gICQoJyN1c2VyLW1lcmdlJykudG9nZ2xlQ2xhc3MgJ2hpZGRlbicsIHNlbGVjdGVkIDwgMlxuICBpZiBzZWxlY3RlZCBpcyAwXG4gICAgJCgnI3NlbGVjdC1hbGwnKS5wcm9wICdpbmRldGVybWluYXRlJywgZmFsc2VcbiAgICAkKCcjc2VsZWN0LWFsbCcpLnByb3AgJ2NoZWNrZWQnLCBmYWxzZVxuICBlbHNlIGlmICQoJ2lucHV0W25hbWU9dXNlcl9kYl06bm90KDpjaGVja2VkKScpLmxlbmd0aCBpcyAwXG4gICAgJCgnI3NlbGVjdC1hbGwnKS5wcm9wICdpbmRldGVybWluYXRlJywgZmFsc2VcbiAgICAkKCcjc2VsZWN0LWFsbCcpLnByb3AgJ2NoZWNrZWQnLCB0cnVlXG4gIGVsc2VcbiAgICAkKCcjc2VsZWN0LWFsbCcpLnByb3AgJ2luZGV0ZXJtaW5hdGUnLCB0cnVlXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBEZWxldGUgVXNlcnMgU3R1ZmZcbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmluaXRfdXNlcl9kZWxldGVfYnRuID0gLT5cbiAgJCgnI3VzZXItZGVsZXRlJykuY2xpY2sgKGUpIC0+XG4gICAgY2xlYXJfbm90aWZpY2F0aW9ucygpXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgY29uZmlybV9tZXNzYWdlID0gKCQodGhpcykuZGF0YSAnY29uZmlybScpLnJlcGxhY2UgJ3t1c2Vyc30nLCAkKCdpbnB1dFtuYW1lPXVzZXJfZGJdOmNoZWNrZWQnKS5sZW5ndGhcbiAgICBpZiBjb25maXJtIGNvbmZpcm1fbWVzc2FnZVxuICAgICAgdXNlcl9rZXlzID0gW11cbiAgICAgICQoJ2lucHV0W25hbWU9dXNlcl9kYl06Y2hlY2tlZCcpLmVhY2ggLT5cbiAgICAgICAgJCh0aGlzKS5hdHRyICdkaXNhYmxlZCcsIHRydWVcbiAgICAgICAgdXNlcl9rZXlzLnB1c2ggJCh0aGlzKS52YWwoKVxuICAgICAgZGVsZXRlX3VybCA9ICQodGhpcykuZGF0YSAnYXBpLXVybCdcbiAgICAgIHN1Y2Nlc3NfbWVzc2FnZSA9ICQodGhpcykuZGF0YSAnc3VjY2VzcydcbiAgICAgIGVycm9yX21lc3NhZ2UgPSAkKHRoaXMpLmRhdGEgJ2Vycm9yJ1xuICAgICAgYXBpX2NhbGwgJ0RFTEVURScsIGRlbGV0ZV91cmwsIHt1c2VyX2tleXM6IHVzZXJfa2V5cy5qb2luKCcsJyl9LCAoZXJyLCByZXN1bHQpIC0+XG4gICAgICAgIGlmIGVyclxuICAgICAgICAgICQoJ2lucHV0W25hbWU9dXNlcl9kYl06ZGlzYWJsZWQnKS5yZW1vdmVBdHRyICdkaXNhYmxlZCdcbiAgICAgICAgICBzaG93X25vdGlmaWNhdGlvbiBlcnJvcl9tZXNzYWdlLnJlcGxhY2UoJ3t1c2Vyc30nLCB1c2VyX2tleXMubGVuZ3RoKSwgJ2RhbmdlcidcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgJChcIiMje3Jlc3VsdC5qb2luKCcsICMnKX1cIikuZmFkZU91dCAtPlxuICAgICAgICAgICQodGhpcykucmVtb3ZlKClcbiAgICAgICAgICB1cGRhdGVfdXNlcl9zZWxlY3Rpb25zKClcbiAgICAgICAgICBzaG93X25vdGlmaWNhdGlvbiBzdWNjZXNzX21lc3NhZ2UucmVwbGFjZSgne3VzZXJzfScsIHVzZXJfa2V5cy5sZW5ndGgpLCAnc3VjY2VzcydcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIE1lcmdlIFVzZXJzIFN0dWZmXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG53aW5kb3cuaW5pdF91c2VyX21lcmdlID0gLT5cbiAgdXNlcl9rZXlzID0gJCgnI3VzZXJfa2V5cycpLnZhbCgpXG4gIGFwaV91cmwgPSAkKCcuYXBpLXVybCcpLmRhdGEgJ2FwaS11cmwnXG4gIGFwaV9jYWxsICdHRVQnLCBhcGlfdXJsLCB7dXNlcl9rZXlzOiB1c2VyX2tleXN9LCAoZXJyb3IsIHJlc3VsdCkgLT5cbiAgICBpZiBlcnJvclxuICAgICAgTE9HICdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZydcbiAgICAgIHJldHVyblxuICAgIHdpbmRvdy51c2VyX2RicyA9IHJlc3VsdFxuICAgICQoJ2lucHV0W25hbWU9dXNlcl9kYl0nKS5yZW1vdmVBdHRyICdkaXNhYmxlZCdcblxuICAkKCdpbnB1dFtuYW1lPXVzZXJfZGJdJykuY2hhbmdlIChldmVudCkgLT5cbiAgICB1c2VyX2tleSA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkudmFsKClcbiAgICBzZWxlY3RfZGVmYXVsdF91c2VyIHVzZXJfa2V5XG5cblxuc2VsZWN0X2RlZmF1bHRfdXNlciA9ICh1c2VyX2tleSkgLT5cbiAgJCgnLnVzZXItcm93JykucmVtb3ZlQ2xhc3MoJ3N1Y2Nlc3MnKS5hZGRDbGFzcygnZGFuZ2VyJylcbiAgJChcIiMje3VzZXJfa2V5fVwiKS5yZW1vdmVDbGFzcygnZGFuZ2VyJykuYWRkQ2xhc3MoJ3N1Y2Nlc3MnKVxuXG4gIGZvciB1c2VyX2RiIGluIHVzZXJfZGJzXG4gICAgaWYgdXNlcl9rZXkgPT0gdXNlcl9kYi5rZXlcbiAgICAgICQoJ2lucHV0W25hbWU9dXNlcl9rZXldJykudmFsIHVzZXJfZGIua2V5XG4gICAgICAkKCdpbnB1dFtuYW1lPXVzZXJuYW1lXScpLnZhbCB1c2VyX2RiLnVzZXJuYW1lXG4gICAgICAkKCdpbnB1dFtuYW1lPW5hbWVdJykudmFsIHVzZXJfZGIubmFtZVxuICAgICAgJCgnaW5wdXRbbmFtZT1lbWFpbF0nKS52YWwgdXNlcl9kYi5lbWFpbFxuICAgICAgYnJlYWtcblxuXG5pbml0X3VzZXJfbWVyZ2VfYnRuID0gLT5cbiAgJCgnI3VzZXItbWVyZ2UnKS5jbGljayAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB1c2VyX2tleXMgPSBbXVxuICAgICQoJ2lucHV0W25hbWU9dXNlcl9kYl06Y2hlY2tlZCcpLmVhY2ggLT5cbiAgICAgIHVzZXJfa2V5cy5wdXNoICQodGhpcykudmFsKClcbiAgICB1c2VyX21lcmdlX3VybCA9ICQodGhpcykuZGF0YSAndXNlci1tZXJnZS11cmwnXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIiN7dXNlcl9tZXJnZV91cmx9P3VzZXJfa2V5cz0je3VzZXJfa2V5cy5qb2luKCcsJyl9XCJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
