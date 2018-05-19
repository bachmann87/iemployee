var expect = require('chai').expect;
var tools = require('./tools');

describe('Tools:\n', function() {

    // Test [1]
    describe('printName()', function() {
        // Describe test
        it('It should print the first name last.', function() {
            // Execute test
            var results = tools.printName({firstname: 'Max', lastname: 'Mustermann'});
            // Expect
            expect(results).to.equal('Mustermann, Max');
        });
    });

    // Test [2]
});