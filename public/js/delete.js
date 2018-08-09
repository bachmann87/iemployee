$(document).ready(function() {

    // --------------
    // Delete Vacancy
    // --------------
    $('.transfer-delete').on('click', function(e) {
        $target = $(e.target);
        let id = $target.attr('data-id');
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

    // ----------------
    // Delete Applicant
    // ----------------
    $('.applicant-delete').on('click', function(e) {
        $target = $(e.target);
        let id = $target.attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/users/delete/'+id,
            success: function(response) {
                window.location.reload();
            }, 
            error: function(err) {
                console.log(err);
            }
        });
    });    

});