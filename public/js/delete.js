$(document).ready(function() {

    // Get Object-ID
    $('.transfer-delete').on('click', function(e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/jobs/delete/'+id,
            success: function(response) {
                window.location.reload();
            }, 
            error: function(err) {
                console.log(err);
            }
        });
    });

});