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
    let base = block.getFieldValue('num_base'); 
    switch (base){
        case '2':
            base = '0b'
            break;
        case '8':
	    base = '0o'
            break;
        case '16': 
            base = '0x'
            break;
        case '10':
            base = ''
            break;
    }
    const value = Number(block.getFieldValue('num_value'));
    // option 을 받아와야 bin/oct/hex값 구분할 수 있음.
    var code = base + value
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::literal::float'] = function(block) {
    const value = block.getFieldValue('num_value');
    const valueArray = value.split('.');
    const integerPart = valueArray[0];
    var fractionalPart = valueArray[1];
    // check output format for floating point
    // should it be like 1.3e+3, -0.2e-5 ... or be like 2.468
    if (fractionalPart.length >= 6){
        fractionalPart 
    }
    var code = valueArray[0]
    
    return [code, vimlangGenerator.PRECEDENCE];
}
