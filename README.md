
# Delete Entity Script

js-delete-entity is a quick deletion method for items with or without a confirmation message, it is also completely backwards compatible with the old emsSimpleModal method.

But there is now no need to setup any modal for deletion, unless a modal is needed to show important information.

## Details

Using this method will allow for:

 - Very quick and easy usage and setup of deletable items
 - Extendable functionality with callbacks, confirmation types, and
   backend deletion methods (compatible with both the standard ‘DELETE’
   method and ‘persist-to-db')
 - Compatible with the current simpleModal method, and can easily switch
   between modal/confirmation box/or no confirmation
 - Choose from preset removal animations or no animation at all
   (currently slide and fade)
 - No changes to backend necessary. I have only removed some force
   refreshes and changes to json responses, but that’s not necessary.
 - Quicker for users to delete items with sleeker UX
 - Has the potential to run multiple deletion requests at once for a
   ‘bulk delete’ method (still to be implemented)
  

# Usage

## Quick Usage:

    <a class="js-ems-delete-btn" data-delete="confirm" data-target-guid="guid_to_delete" data-target-name="lang_name_key" href="url_to_controller"></a>

Available methods: 

    data-delete="confirm/force/modal"

  

## Javascript Usage:


Simple Usage:

    var innovedDeleteEntity = $('.js-ems-delete-btn).innovedDeleteEntity();
    
    innovedDeleteEntity.confirm();

  

With optional parameters:

  

    var settings = {
    
	    event: event, //mandatory
	    
	    animation: 'slideRight', 'fadeOut', yourCustomAnimation, false //removal animations
	    
	    confirmType: 'modal', //open in modal
	    
	    onDeleteSuccess: function() {
	    
	    //on successful deletion
    
    }
    
    onDeleteFail: function() {
    
	    //on failure of deletion request (ajax fail or false response)
    
    }
    
    onPreConfirm: function() {
    
	    //on click before confirmation
    
    }
    
    onConfirm: function() {
    
	    //on confirmation accept
    
    }
    
    onClickForce: function() {
    
	    //on force delete
    
    }
    
      
    
    innovedDeleteEntity.confirm(settings);
    
    innovedDeleteEntity.force(settings);

  

confirmType: 'modal' will open a confirmation using simpleModal

  

Required: Your button must have a 'data-target-guid' (unless it is using the modal method) and a 'href' attribute.

Required: The element to delete must have a 'data-guid' (unless it is using the modal method)

Optional: Your button may have a 'data-target-name' attribute.

## Current Usage in Application

See http://ccf.local.vm/ems/cf/config/assessment-sets

Click the 'options dropdown button' on the right hand side of a list item. Click 'Delete Assessment Scoring Set'. A small popover should appear above the dropdown asking to confirm. On confirmation a loading state will appear and shortly the item will slide out of the right of the screen and a flash notification will appear saying success.

See http://ccf.local.vm/ems/cf/config/comment-template-groups

Deleting an item from this list should open in a popup. Once confirming deletion the page should reload and a flash message should appear confirming deletion.