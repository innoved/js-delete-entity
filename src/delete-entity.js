//import innovedFlashMessage from 'js-flash-message';

(function($) {

    'use strict';

    const InnovedDeleteEntity = function(element, options) {
  
        let switchArr = [];
        const $deleteButton = $(element);
        const obj = this;
        const namespace = {
            global: 'innovedDeleteEntity',
            classPrefix: 'js-delete-'
        };
    
        //init settings and callback funcs
        const settings = $.extend({
            onDeleteSuccess: function() {},
            onDeleteFail: function() {},
            onPreConfirm: function() {},
            onConfirm: function() {},
            onClickForce: function() {},
        }, options || {});
    
        /**
        * Private methods
        */
        const errorMsg = function(target) {
            const targetName = target == undefined ? 'item' : target.name;
            const s = typeof target.guid == 'object' ? 's' : '';
            innovedFlashMessage.create('error', 'Something went wrong', `The ${targetName + s} could not be deleted`);
            console.log('Something went wrong', `The ${targetName} could not be deleted`);
        };
    
        //element exit animation, accepts preset strings and custom function
        const exitAnimation = function($targetElement, animation) {
            if(typeof animation === 'undefined' || animation == '') {
                $targetElement.remove();
                return this;
            } else {
                switch(animation) {
                    case false:
                    case null:
                        return false;
                    case 'slideRight':
                        $targetElement.css('-moz-transition', 'none');
                        $targetElement.css('-webkit-transition', 'none');
                        $targetElement.css('-o-transition', 'color 0 ease-in');
                        $targetElement.css('transition', 'none');
                        TweenMax.to($targetElement, 0.6, { x: '100%', ease: Power3.easeOut, onComplete:function() { $targetElement.remove(); } });
                        break;
                    case 'fadeOut':
                        $targetElement.addClass('fade-out');
                        setTimeout(function() {
                            $targetElement.remove();
                        }, 250);
                        break;
                    default:
                        animation();
                }
            }
            return this;
        };
    
        //on deletion success. mainly UI stuff
        const deleteSuccess = function(target, $deleteButton, $deleteBox, $targetElement, animation) {
            settings.onDeleteSuccess.call(this);
            $deleteBox.addClass(namespace.classPrefix+'box-deleted');
            $deleteButton.removeClass(namespace.classPrefix+'btn-selected');

            setTimeout(function() {
                $deleteBox.removeClass(namespace.classPrefix+'box-loading').removeClass(namespace.classPrefix+'box-deleted');
            }, 1000);

            // function timeout(ms) {
            //     return new Promise(res => setTimeout(res, ms));
            // }

            // function removeLoadingState() {
            //     $deleteBox.removeClass(namespace.classPrefix+'box-loading').removeClass(namespace.classPrefix+'box-deleted');
            // }

            // function removeBox() {
            //     $deleteBox.remove();
            // }

            // async function fireEvents() {
            //     await timeout(1000);
            //     removeLoadingState();
            //     removeBox();
            // }

            // fireEvents();

            if(animation != false && animation != undefined) {
                setTimeout(function() {
                    $($(target)[0].$element).each(function() {
                        exitAnimation($(this), animation);
                    });
                }, 500);
            };
            const s = typeof target.guid == 'object' ? 's' : '';
            innovedFlashMessage.create('success', `The ${target.name + s} has been deleted`);
        };
    
        //deletion request function
        const runDelete = function(target, $deleteButton, $deleteBox, animation) {
            const data = { _token: $('meta[name="_token"]').attr('content') };

            //if were sending multiple guids let the backend know
            data.multi = typeof target.guid == 'object' ? true : false;
            
            $.ajax({url: $deleteButton[0].href, type: 'DELETE', data:data, dataType: 'json'
            }).done(response => {
                if(response.success != false) {
                    if(response.reload == true) {
                        location.reload();
                        return false;
                    };
                    deleteSuccess(target, $deleteButton, $deleteBox, target.$element, animation);
                } else {
                    settings.onDeleteFail.call(this);
                    errorMsg(target);
                    console.log(response);
                };
            }).fail((xhr, textStatus, errorThrown) => {
                settings.onDeleteFail.call(this);
                $.error('Request Failed on '+namespace.global+' '+textStatus);
                console.log(errorThrown);
            }).always(response => {
                $deleteButton.removeClass(namespace.classPrefix+'btn-selected');
                setTimeout(function(){
                    $deleteBox.removeClass(namespace.classPrefix+'box-loading').removeClass(namespace.classPrefix+'box-deleted');
                },1000);
            });
        };
    
        //create the confirmation/loading box for each button
        const buildDeleteBox = function($deleteButton) {
            if(!$deleteButton.hasClass(namespace.classPrefix+'btn')) {
                $deleteButton.addClass(namespace.classPrefix+'btn');
            };
            if(!$deleteButton.find('.'+namespace.classPrefix+'box').length) {
                $deleteButton.append(`<span class="${namespace.classPrefix}box"><p>Are you sure you want to delete?</p><span class="${namespace.classPrefix}cancel">Cancel</span><span class="${namespace.classPrefix}confirm">Yes</span></span>`);
            }
            return $deleteButton.find(`.${namespace.classPrefix}box`);
        };
    
        //return the element to delete from the guid
        const getTarget = function(event, confirmType) {

            let target = {},
                guids = [],
                elements = [];

            if(confirmType == 'multi') {

                //loop through each checked box and append the target guids and jquery elements to an array
                $('[data-guid="'+event.currentTarget.dataset.targetGuid+'"]:checked').each(function() {
                    guids.push($(this)[0].dataset.targetGuid);
                    elements.push($('[data-guid="'+$(this).data('target-guid')+'"]'));
                });

                if(guids.length == 0 || elements.length == 0 ) {
                    return false;
                }

                target = {
                    guid: guids,
                    $element: elements,
                    name: event.currentTarget.dataset.targetName || 'item'
                }

            } else {
                target = {
                    guid: event.currentTarget.dataset.targetGuid,
                    $element: $('[data-guid="'+event.currentTarget.dataset.targetGuid+'"]'),
                    name: event.currentTarget.dataset.targetName || 'item'
                }
            }

            if(!target.$element.length > 0) {
                errorMsg(target);
                console.log(namespace.global+' The target element to delete does not exist');
                return false;
            }
            return target;

        };

        /**
        * Public methods
        */

        //switch specific targets with checkboxes for multiple deletion method and vice versa
        this.checkboxSwitch = function($switchBtn) {
            const guid = [...Array(10)].map(i=>(~~(Math.random()*36)).toString(36)).join('');

            //grab stored elements from array and remove checkboxes
            if ($('#js-delete-btn-multi').length) {
                if(options != undefined && 'innerSwitch' in options) {
                    options.innerSwitch.forEach(function(entry) {
                        const targetGuid = entry[0].dataset.targetGuid;
                        $('.js-delete-checkbox[data-target-guid="'+targetGuid+'"]').each(function() {
                            $(this).replaceWith(entry[0]);
                        });
                    });
                    $('#js-delete-btn-multi').remove();
                    switchArr = [];
                    $('#js-delete-btn').innovedDeleteEntity();
                }
            } else {
                //store each element in array and build render checkboxes
                $('.js-delete-checkbox-switch').each(function() {
                    switchArr.push($(this));
                    $(this).replaceWith(`<input type="checkbox" class="js-delete-checkbox" data-target-guid="${$(this).data('target-guid')}" data-guid="${guid}">`)
                });
                $switchBtn.after(`<button class="js-delete-btn" id="js-delete-btn-multi" data-delete="multi" data-target-guid="${guid}">Delete Selected</button>`);

                //assign the deletion object and pass the element array
                $('#js-delete-btn-multi').innovedDeleteEntity({
                    innerSwitch: switchArr
                });
            }
            
        };
        
        this.confirm = function(data) {

            settings.onPreConfirm.call(obj);

            //run modal method
            if(typeof data.confirmType !== undefined && data.confirmType == 'modal') {
                innovedSimpleModal.openModal($(data.event.currentTarget));
                return false;
            }
    
            if(data.event === undefined) {
                errorMsg();
                console.log(namespace.global+': No event or guid was passed into the deletion method.');
                return false;
            }
    
            if(typeof data.event.currentTarget.dataset.targetGuid === 'undefined') {
                errorMsg();
                console.log(namespace.global+': No event or guid was passed into the deletion method.');
                return false;
            }
    
            const target = getTarget(data.event, data.confirmType);
            if(target == false) return false;

            const $deleteButton = $(data.event.currentTarget);
    
            data.event.stopPropagation();
            const $deleteBox = buildDeleteBox($deleteButton);
    
            if(!$deleteButton.hasClass(namespace.classPrefix+'btn-selected')) {
                $deleteButton.addClass(namespace.classPrefix+'btn-selected');
    
                $deleteButton.find(`.${namespace.classPrefix}cancel`).off('click').on('click',function() {
                    $deleteButton.removeClass(namespace.classPrefix+'btn-selected');
                    return false;
                });
    
                //if the delete button is in a dropdown, hide the confirmation on close
                if ($deleteButton.parents('.dropdown').length) {
                    $deleteButton.parents('.dropdown').off().on('hidden.bs.dropdown', function () {
                        $deleteButton.removeClass(namespace.classPrefix+'btn-selected');
                        return false;
                    });
                };
    
                //if the confirmation box is outside the screen bring it back in
                if($deleteBox.offset().left + $deleteBox.outerWidth() > $(window).width()){
                    $deleteBox.addClass(namespace.classPrefix+'box-hit-edge');
                }
    
                $deleteButton.find(`.${namespace.classPrefix}confirm`).off('click').on('click',function() {
                    settings.onConfirm.call(obj);
                    $deleteBox.addClass(namespace.classPrefix+'box-loading');
    
                    //check the deletion method. persist-to-db or the standard method
                    if(data.deleteMethod == 'persist-to-db') {
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
    
        };
    
        //force delete with no confirmation
        this.force = function(data) {
    
            settings.onClickForce.call(obj);
    
            const target = getTarget(event),
                $deleteButton = $(event.currentTarget);
    
            data.event.stopPropagation();
            const $deleteBox = buildDeleteBox($deleteButton);
    
            if(!$deleteButton.hasClass(namespace.classPrefix+'btn-selected')) {
                $deleteBox.addClass(namespace.classPrefix+'-box-loading');
                setTimeout(function(){
                    $deleteButton.addClass(namespace.classPrefix+'-btn-selected');
                },50);
                runDelete(target, $deleteButton, $deleteBox, data.animation);
            } else {
                return false;
            }
            return this;
        };
  
    };
  
    $.fn.innovedDeleteEntity = function(options) {
        const $element = $(this);
    
        //return early if this element already has a plugin instance
        if ($element.data('innovedDeleteEntity')) return $element.data('innovedDeleteEntity');
    
        //pass options to plugin constructor
        const innovedDeleteEntity = new InnovedDeleteEntity(this, options);
    
        //store plugin object in this element's data
        $element.data('innovedDeleteEntity', innovedDeleteEntity);
    
        //default events
        $element.off('click').on('click', function(e) {
            e.preventDefault();
            const $this = $(this);
            
            /*  preset events from whatever data-delete is set to, 
            *   if data-delete is not set, the function should be called manually
            */
            switch($this.data('delete')) {
                case 'confirm':
                    innovedDeleteEntity.confirm({event: e,  animation: 'fadeOut'});
                    break;
                case 'modal':
                    innovedDeleteEntity.confirm({event: e,  confirmType: 'modal'});
                    break;
                case 'multi':
                    innovedDeleteEntity.confirm({event: e,  confirmType: 'multi', animation: 'fadeOut'});
                    break;
                case 'persist-to-db':
                    innovedDeleteEntity.confirm({event: e,  deleteMethod: 'persist-to-db', animation: 'slideRight'});
                    break;
                case 'force':
                    innovedDeleteEntity.force({event: e,  animation: 'slideRight'});
                    break;
                default:
                    return false;
            }
    
            return false;
    
        });

        $('.js-delete-checkbox-switch-btn').off('click').on('click', function(e) {
            e.preventDefault();
            innovedDeleteEntity.checkboxSwitch($(this));
        });
    
        return innovedDeleteEntity;
    };
})(jQuery);

//export for package
export default $.fn.innovedDeleteEntity();