"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _flashMessage = _interopRequireDefault(require("js-flash-message/src/flash-message"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

(function ($) {
  'use strict';

  var InnovedDeleteEntity = function InnovedDeleteEntity(element, options) {
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

      _flashMessage.default.create('error', 'Something went wrong', "The ".concat(targetName, " could not be deleted"));

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
    }; //on deletion success. mainly UI stuff


    var deleteSuccess = function deleteSuccess(target, $deleteButton, $deleteBox, $targetElement, animation) {
      settings.onDeleteSuccess.call(this);
      $deleteBox.addClass(namespace.classPrefix + 'box-deleted');
      $deleteButton.removeClass(namespace.classPrefix + 'btn-selected');
      setTimeout(function () {
        $deleteBox.removeClass(namespace.classPrefix + 'box-loading').removeClass(namespace.classPrefix + 'box-deleted');
      }, 1000);

      if (animation != false && animation != undefined) {
        setTimeout(function () {
          exitAnimation(target.$element, animation);
        }, 500);
      }

      ;

      _flashMessage.default.create('success', "The ".concat(target.name, " has been deleted"));
    }; //deletion request function


    var runDelete = function runDelete(target, $deleteButton, $deleteBox, animation) {
      var _this = this;

      var data = {
        _token: $('meta[name="_token"]').attr('content')
      };
      console.log(data);
      return false;
      $.ajax({
        url: $deleteButton[0].href,
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
        } else {
          settings.onDeleteFail.call(_this);
          errorMsg(target);
          console.log(response);
        }

        ;
      }).fail(function (xhr, textStatus, errorThrown) {
        settings.onDeleteFail.call(_this);
        $.error('Request Failed on ' + namespace.global + ' ' + textStatus);
        console.log(errorThrown);
      }).always(function (response) {
        $deleteButton.removeClass(namespace.classPrefix + 'btn-selected');
        setTimeout(function () {
          $deleteBox.removeClass(namespace.classPrefix + 'box-loading').removeClass(namespace.classPrefix + 'box-deleted');
        }, 1000);
      });
    }; //create the confirmation/loading box for each button


    var buildDeleteBox = function buildDeleteBox($deleteButton) {
      if (!$deleteButton.hasClass(namespace.classPrefix + 'btn')) {
        $deleteButton.addClass(namespace.classPrefix + 'btn');
      }

      ;

      if (!$deleteButton.find('.' + namespace.classPrefix + 'box').length) {
        $deleteButton.append("<span class=\"".concat(namespace.classPrefix, "box\"><p>Are you sure you want to delete?</p><span class=\"").concat(namespace.classPrefix, "cancel\">Cancel</span><span class=\"").concat(namespace.classPrefix, "confirm\">Yes</span></span>"));
      }

      return $deleteButton.find(".".concat(namespace.classPrefix, "box"));
    }; //return the element to delete from the guid


    var getTarget = function getTarget(event, confirmType) {
      if (confirmType == 'multi') {} else {
        var _target = {
          guid: event.currentTarget.dataset.targetGuid,
          $element: $('[data-guid="' + event.currentTarget.dataset.targetGuid + '"]'),
          name: event.currentTarget.dataset.targetName || 'item'
        };
      } // ? for single or both


      if (!target.$element.length > 0) {
        errorMsg(target);
        console.log(namespace.global + ' The target element does not exist in the DOM');
        return false;
      }

      return target; //TODO: for multiple selects we can pass an array of guids
    };

    this.checkboxSwitch = function () {
      var guid = _toConsumableArray(Array(10)).map(function (i) {
        return (~~(Math.random() * 36)).toString(36);
      }).join('');

      $('.js-delete-checkbox-switch').each(function () {
        //store each in object
        $(this).replaceWith('<input type="checkbox" class="js-delete-checkbox" data-target-guid="d2" data-guid="' + guid + '">');
      });
    };
    /**
    * Public methods
    */


    this.confirm = function (data) {
      settings.onPreConfirm.call(obj); //run modal method

      if (_typeof(data.confirmType) !== undefined && data.confirmType == 'modal') {
        emsSimpleModals.openModal($deleteButton);
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
      var $deleteButton = $(data.event.currentTarget);
      data.event.stopPropagation();
      var $deleteBox = buildDeleteBox($deleteButton);

      if (!$deleteButton.hasClass(namespace.classPrefix + 'btn-selected')) {
        $deleteButton.addClass(namespace.classPrefix + 'btn-selected');
        $deleteButton.find(".".concat(namespace.classPrefix, "cancel")).off('click').on('click', function () {
          $deleteButton.removeClass(namespace.classPrefix + 'btn-selected');
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
            confirmType: 'multi'
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
    $('.js-delete-checkbox-switch-btn').on('click', function (e) {
      e.preventDefault();
      innovedDeleteEntity.checkboxSwitch();
    });
    return innovedDeleteEntity;
  };
})(jQuery); //export for package


var _default = $.fn.innovedDeleteEntity();

exports.default = _default;
