const vimlangGenerator = new Blockly.Generator('Vim');

vimlangGenerator.PRECEDENCE = 0;
/* How to write generator code */
/* helpurl: https://developers.google.com/blockly/guides/create-custom-blocks/generating-code
 * 1. Collect the Arguments.
 *   - getFieldValue(): 
 *   - valueToCode(): 
 *   - statementToCode(): 
 * 2. Assembling Code. 
 */

vimlangGenerator['vim::literal::number'] = function(block) {
    //const code = Number(block.getFieldValue('num_value'));
    // option 을 받아와야 bin/oct/hex값 구분할 수 있음.
    return ['this_is_string_dummy_return', vimlangGenerator.PRECEDENCE];
}
