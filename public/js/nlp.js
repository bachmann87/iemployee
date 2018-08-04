$(document).ready(function() {

    // Init DataTable
    $('#myTable').DataTable({
        responsive: true
    });

    // Init Select
    $('.selectpicker').selectpicker();


    // ----------------
    // iEmployee - API
    // ----------------

    // Get User-ID
    let _id = document.getElementById('userId').getAttribute('data-id');

    // Get Data
    $.ajax({
        type: 'GET',
        url: '/nlp/api/'+_id,
        success: function(data) {
            // Set Bio
            _bio(data);
            // Set Trie
            _trie(data);
            
        }, 
        error: function(err) {
            console.log(err);
        }
    });
    
    function _bio(data) {
        // Get Data
        let sentences = data.output.summary;
        let target = document.querySelector('#bio');
        // Create Elements
        let el = document.createElement('p');
        // Init Text
        let bio = "";
        // Iterate
        for(let i=0;i<sentences.length;i++) {
            bio += sentences[i] + ' ';
        }
        // Create Text Node
        let node = document.createTextNode(bio);
        // Append to Element
        el.appendChild(node);
        // Append to DOM
        target.appendChild(el);
    }
    
    function _trie(data) {
        // Get Data
        let keys = Object.keys(data.output.trie.result);
        let score = data.output.trie.score;
        // Iterate 
    }

} );