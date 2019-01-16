"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function ($) {
  'use strict';

  var InnovedDeleteEntity = function InnovedDeleteEntity(element, options) {
    var switchArr = [];
    var $deleteButton = $(element);
    var obj = this;
    var namespace = {
      global: 'innovedDeleteEntity',
      classPrefix: 'js-delete-'
    }; //init settings and callback funcs

    var settings = $.extend({
      onDeleteSuccess: function onDeleteSuccess() {},
      onDeleteFail: function onDeleteFail() {},
      onPreConfirm: function onPreConfirm() {},
      onConfirm: function onConfirm() {},
      onClickForce: function onClickForce() {}
    }, options || {});
    /**
    * Private methods
    */

    var errorMsg = function errorMsg(target) {
      var targetName = target == undefined ? 'item' : target.name;
      var pluralItem = _typeof(target.guid) == 'object' && target.guid.length > 1 ? 's' : '';
      innovedFlashMessage.create('error', 'Something went wrong', "The ".concat(targetName + pluralItem, " could not be deleted"));
      console.log('Something went wrong', "The ".concat(targetName, " could not be deleted"));
    }; //element exit animation, accepts preset strings and custom function


    var exitAnimation = function exitAnimation($targetElement, animation) {
      if (typeof animation === 'undefined' || animation == '') {
        $targetElement.remove();
        return this;
      } else {
        switch (animation) {
          case false:
          case null:
            return false;

          case 'slideRight':
            $targetElement.css('-moz-transition', 'none');
            $targetElement.css('-webkit-transition', 'none');
            $targetElement.css('-o-transition', 'color 0 ease-in');
            $targetElement.css('transition', 'none');
            TweenMax.to($targetElement, 0.6, {
              x: '100%',
              ease: Power3.easeOut,
              onComplete: function onComplete() {
                $targetElement.remove();
              }
            });
            break;

          case 'fadeOut':
            $targetElement.addClass('fade-out');
            setTimeout(function () {
              $targetElement.remove();
            }, 250);
            break;

          default:
            animation();
        }
      }

      return this;
    };

    var removeDeleteBox = function removeDeleteBox($deleteBox, $deleteButton) {
      $deleteBox.remove();
      $deleteButton.removeClass(namespace.classPrefix + 'btn-selected');
    }; //on deletion success


    var deleteSuccess = function deleteSuccess(target, $deleteButton, $deleteBox, $targetElement, animation) {
      settings.onDeleteSuccess.call(this);
      $deleteBox.addClass(namespace.classPrefix + 'box-deleted');

      if (animation != false && animation != undefined) {
        setTimeout(function () {
          //run an increment timer here to animate each item individually
          $($(target)[0].$element).each(function (i) {
            var $this = $(this);
            setTimeout(function () {
              exitAnimation($this, animation);
            }, i * 400);
          });
        }, 500);
      }

      ;
      var pluralItem = _typeof(target.guid) == 'object' && target.guid.length > 1 ? 's' : '';
      var pluralHas = _typeof(target.guid) == 'object' && target.guid.length > 1 ? 'have' : 'has';
      innovedFlashMessage.create('success', '', "The ".concat(target.name + pluralItem, " ").concat(pluralHas, " been deleted"), {
        preventDuplicates: true
      });
    }; //request to backend


    var deletionRequest = function deletionRequest(url, data, target, $deleteButton, $deleteBox, animation) {
      var _this = this;

      $.ajax({
        url: url,
        type: 'DELETE',
        data: data,
        dataType: 'json'
      }).done(function (response) {
        if (response.success != false) {
          if (response.reload == true) {
            location.reload();
            return false;
          }

          ;
          deleteSuccess(target, $deleteButton, $deleteBox, target.$element, animation);
          setTimeout(function () {
            removeDeleteBox($deleteBox, $deleteButton);
          }, 1000);
        } else {
          removeDeleteBox($deleteBox, $deleteButton);
          settings.onDeleteFail.call(_this);
          console.log(response);
          errorMsg(target);
        }

        ;
      }).fail(function (xhr, textStatus, errorThrown) {
        removeDeleteBox($deleteBox, $deleteButton);
        settings.onDeleteFail.call(_this);
        errorMsg(target);
        $.error('Request Failed on ' + namespace.global + ' ' + textStatus);
        console.log(errorThrown);
      });
    }; //deletion request function


    var runDelete = function runDelete(target, $deleteButton, $deleteBox, animation) {
      var data = {
        _token: $('meta[name="_token"]').attr('content')
      }; //if were deleting multiple elements run a deletion request for each element

      if (_typeof(target.guid) == 'object') {
        data.multi = true;
        var url = $('.js-delete-checkbox-switch-btn').data('href');
        $($(target)[0].$element).each(function () {
          var thisUrl = url.replace('-guid-', $(this).data('guid'));
          deletionRequest(thisUrl, data, target, $deleteButton, $deleteBox, animation);
        });
      } else {
        data.multi = false;
        deletionRequest($deleteButton[0].href, data, target, $deleteButton, $deleteBox, animation);
      }
    }; //create the confirmation/loading box for each button


    var buildDeleteBox = function buildDeleteBox($deleteButton, target) {
      if (!$deleteButton.hasClass(namespace.classPrefix + 'btn')) {
        $deleteButton.addClass(namespace.classPrefix + 'btn');
      }

      ;

      if (!$deleteButton.find('.' + namespace.classPrefix + 'box').length) {
        var pluralMsg = _typeof(target.guid) == 'object' ? ' the selected items?' : '?';
        $deleteButton.append("<span class=\"".concat(namespace.classPrefix, "box\"><p>Are you sure you want to delete").concat(pluralMsg, "</p><span class=\"").concat(namespace.classPrefix, "cancel\">Cancel</span><span class=\"").concat(namespace.classPrefix, "confirm\">Yes</span></span>"));
      }

      return $deleteButton.find(".".concat(namespace.classPrefix, "box"));
    }; //return the element to delete from the guid


    var getTarget = function getTarget(event, confirmType) {
      var target = {},
          guids = [],
          elements = [];

      if (confirmType == 'multi') {
        //loop through each checked box and append the target guids and jquery elements to an array
        $('[data-guid="' + event.currentTarget.dataset.targetGuid + '"]:checked').each(function () {
          guids.push($(this)[0].dataset.targetGuid);
          elements.push($('[data-guid="' + $(this).data('target-guid') + '"]'));
        });

        if (guids.length == 0 || elements.length == 0) {
          innovedFlashMessage.create('warning', 'No items have been selected', 'Please check the items you wish to delete', {
            preventDuplicates: true
          });
          return false;
        }

        target = {
          guid: guids,
          $element: elements,
          name: event.currentTarget.dataset.targetName || 'item'
        };
      } else {
        target = {
          guid: event.currentTarget.dataset.targetGuid,
          $element: $('[data-guid="' + event.currentTarget.dataset.targetGuid + '"]'),
          name: event.currentTarget.dataset.targetName || 'item'
        };
      }

      if (!target.$element.length > 0) {
        errorMsg(target);
        console.log(namespace.global + ' The target element to delete does not exist');
        return false;
      }

      return target;
    };
    /**
    * Public methods
    */
    //switch specific targets with checkboxes for multiple deletion method and vice versa


    this.checkboxSwitch = function ($switchBtn) {
      var guid = _toConsumableArray(Array(10)).map(function (i) {
        return (~~(Math.random() * 36)).toString(36);
      }).join('');

      var switchBtn = $('.js-delete-checkbox-switch-btn'); //grab stored elements from array and remove checkboxes

      if ($('.js-delete-btn-multi').length) {
        if (options != undefined && 'innerSwitch' in options) {
          options.innerSwitch.forEach(function (entry) {
            var targetGuid = entry[0].dataset.targetGuid;
            $('.js-delete-checkbox[data-target-guid="' + targetGuid + '"]').each(function () {
              $(this).replaceWith(entry[0]);
            });
          });
          $('.js-delete-btn-multi').remove();
          switchArr = [];
          switchBtn.html(options.textSwitchTo);
          $('.js-delete-btn').innovedDeleteEntity();
        }
      } else {
        //store each element in array and build checkboxes
        $('.js-delete-checkbox-switch').each(function () {
          switchArr.push($(this));
          $(this).replaceWith("<input type=\"checkbox\" class=\"js-delete-checkbox\" data-target-guid=\"".concat($(this).data('target-guid'), "\" data-guid=\"").concat(guid, "\" title=\"Check to delete\">"));
        });
        $switchBtn.after("<a href=\"#\" class=\"js-delete-btn js-delete-btn-multi\" data-delete=\"multi\" data-target-guid=\"".concat(guid, "\">Delete Selected</a>"));
        var textSwitchTo = switchBtn.html();
        switchBtn.html(switchBtn.data('text-back')); //assign the deletion object and pass the element array

        $('.js-delete-btn-multi').innovedDeleteEntity({
          innerSwitch: switchArr,
          textSwitchTo: textSwitchTo
        });
      }
    };

    this.confirm = function (data) {
      settings.onPreConfirm.call(obj); //run modal method

      if (_typeof(data.confirmType) !== undefined && data.confirmType == 'modal') {
        innovedSimpleModal.openModal($(data.event.currentTarget));
        return false;
      }

      if (data.event === undefined) {
        errorMsg();
        console.log(namespace.global + ': No event or guid was passed into the deletion method.');
        return false;
      }

      if (typeof data.event.currentTarget.dataset.targetGuid === 'undefined') {
        errorMsg();
        console.log(namespace.global + ': No event or guid was passed into the deletion method.');
        return false;
      }

      var target = getTarget(data.event, data.confirmType);
      if (target == false) return false;
      var $deleteButton = $(data.event.currentTarget);
      data.event.stopPropagation();
      var $deleteBox = buildDeleteBox($deleteButton, target);

      if (!$deleteButton.hasClass(namespace.classPrefix + 'btn-selected')) {
        $deleteButton.addClass(namespace.classPrefix + 'btn-selected');
        $deleteButton.find(".".concat(namespace.classPrefix, "cancel")).off('click').on('click', function () {
          $deleteButton.removeClass(namespace.classPrefix + 'btn-selected');
          $deleteBox.remove();
          return false;
        }); //if the delete button is in a dropdown, hide the confirmation on close

        if ($deleteButton.parents('.dropdown').length) {
          $deleteButton.parents('.dropdown').off().on('hidden.bs.dropdown', function () {
            $deleteButton.removeClass(namespace.classPrefix + 'btn-selected');
            return false;
          });
        }

        ; //if the confirmation box is outside the screen bring it back in

        if ($deleteBox.offset().left + $deleteBox.outerWidth() > $(window).width()) {
          $deleteBox.addClass(namespace.classPrefix + 'box-hit-edge');
        }

        $deleteButton.find(".".concat(namespace.classPrefix, "confirm")).off('click').on('click', function () {
          settings.onConfirm.call(obj);
          $deleteBox.addClass(namespace.classPrefix + 'box-loading'); //check the deletion method. persist-to-db or the standard method

          if (data.deleteMethod == 'persist-to-db') {
            persistToDb($deleteButton, [], [], deleteSuccess(target, $deleteButton, $deleteBox, target.$element, data.animation));
          } else {
            runDelete(target, $deleteButton, $deleteBox, data.animation);
          }

          return false;
        });
      } else {
        return false;
      }

      return this;
    }; //force delete with no confirmation


    this.force = function (data) {
      settings.onClickForce.call(obj);
      var target = getTarget(event),
          $deleteButton = $(event.currentTarget);
      data.event.stopPropagation();
      var $deleteBox = buildDeleteBox($deleteButton);

      if (!$deleteButton.hasClass(namespace.classPrefix + 'btn-selected')) {
        $deleteBox.addClass(namespace.classPrefix + '-box-loading');
        setTimeout(function () {
          $deleteButton.addClass(namespace.classPrefix + '-btn-selected');
        }, 50);
        runDelete(target, $deleteButton, $deleteBox, data.animation);
      } else {
        return false;
      }

      return this;
    };
  };

  $.fn.innovedDeleteEntity = function (options) {
    var $element = $(this); //return early if this element already has a plugin instance

    if ($element.data('innovedDeleteEntity')) return $element.data('innovedDeleteEntity'); //pass options to plugin constructor

    var innovedDeleteEntity = new InnovedDeleteEntity(this, options); //store plugin object in this element's data

    $element.data('innovedDeleteEntity', innovedDeleteEntity); //default events

    $element.off('click').on('click', function (e) {
      e.preventDefault();
      var $this = $(this);
      /*  preset events from whatever data-delete is set to, 
      *   if data-delete is not set, the function should be called manually
      */

      switch ($this.data('delete')) {
        case 'confirm':
          innovedDeleteEntity.confirm({
            event: e,
            animation: 'slideRight'
          });
          break;

        case 'modal':
          innovedDeleteEntity.confirm({
            event: e,
            confirmType: 'modal'
          });
          break;

        case 'multi':
          innovedDeleteEntity.confirm({
            event: e,
            confirmType: 'multi',
            animation: 'slideRight'
          });
          break;

        case 'persist-to-db':
          innovedDeleteEntity.confirm({
            event: e,
            deleteMethod: 'persist-to-db',
            animation: 'slideRight'
          });
          break;

        case 'force':
          innovedDeleteEntity.force({
            event: e,
            animation: 'slideRight'
          });
          break;

        default:
          return false;
      }

      return false;
    });
    $('.js-delete-checkbox-switch-btn').off('click').on('click', function (e) {
      e.preventDefault();
      innovedDeleteEntity.checkboxSwitch($(this));
    });
    return innovedDeleteEntity;
  };
})(jQuery); //export for package


var _default = $.fn.innovedDeleteEntity();

exports.default = _default;
