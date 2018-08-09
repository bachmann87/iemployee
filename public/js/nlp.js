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
            // Parse Mobile
            _parse_mobile(data);
            // Get Entities
            _get_entities(data);
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

    function _parse_mobile(data) {
        // ...
        console.log(data.nlp.input.cv);
        
    }

    function _get_entities(data) {

        // Get Data
        let entities = data.output.entities.result;
        console.log(entities.length);
        let target1 = document.querySelector('#organisation');        
        let target2 = document.querySelector('#locations');

        // Create Text Nodes for Organisations
        for(let i=0;i<entities[0].length;i++) {
            // Create Element
            let div = document.createElement('div');
            div.classList.add('list-group-item');
            let node = document.createTextNode(entities[0][i]);
            // Append to Element
            div.appendChild(node);
            // Append to DOM
            target1.appendChild(div);
        }

        // Create Text Nodes for Locations
        for(let i=0;i<entities[1].length;i++) {
            // Create Element
            let div = document.createElement('div');
            div.classList.add('list-group-item');
            let node = document.createTextNode(entities[1][i]);
            // Append to Element
            div.appendChild(node);
            // Append to DOM
            target2.appendChild(div);
        }        
                
    }

} );