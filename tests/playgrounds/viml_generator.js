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

// [ignore this code section]
// 숫자가 너무 길면 (e표시->일반) ex) -0.00004508 >> -4.508e-5
// 숫자가 너무 짧으면 (일반->e표시) ex) 0.1e-1 >> 0.001
/*
vimlangGenerator['vim::literal::float'] = function(block) {
    const value = block.getFieldValue('num_value');
    const valueArray = value.split('.');
    const integerPart = valueArray[0];
    var fractionalPart = valueArray[1];
    var code = '';
    // check output format for floating point
    // should it be like 1.3e+3, -0.2e-5 ... or be like 2.468
    var flag = false;
    for (var i=0; i<fractionalPart.length; i++){
        if(fractionalPart.charAt(i) != '0'){
	    flag = true;
        }
        if(flag){
            code += fractionalPart.charAt(i);
        }
    }
    code = valueArray[0]
    
    return [code, vimlangGenerator.PRECEDENCE];
}
*/

vimlangGenerator['vim::literal::float'] = function(block) {
    const code = block.getFieldValue('num_value');
    return [code, vimlangGenerator.PRECEDENCE];
}

// string 안에서 작은 따옴표, 큰 따옴표 사용에 제약을 걸어야 하지 않나
vimlangGenerator['vim::literal::string'] = function(block) {
    const code = block.getFieldValue('str_value');
    return '"' + code + '"' ;
}

vimlangGenerator['vim::literal::literal_string'] = function(block) {
    const code = block.getFieldValue('str_value');
    return "'" + code + "'" ;
}

// Blob (Binary Large OBject)
vimlangGenerator['vim::literal::blob'] = function(block) {
    var code = block.getFieldValue('byte_value');
    code = '0z' + code;
    return [code, vimlangGenerator.PRECEDENCE];
}

// vim::literal::true, false, none, null 점검필요
vimlangGenerator['vim::literal::true'] = function(block) {
    // if str >> v:true
    // if num >> true || 1
    return 'v:true';
}

vimlangGenerator['vim::literal::false'] = function(block) {
    // if str >> v:false
    // if num >> false || 1
    return 'v:false';
}

vimlangGenerator['vim::literal::none'] = function(block) {
    // if str >> v:none
    // if num >> 0 
    return 'v:none';
}

vimlangGenerator['vim::literal::null'] = function(block) {
    // if str >> v:null
    // if num >> 0
    return 'v:null';
}

vimlangGenerator['vim::let'] = functioin(block) {
    let operator = block.getFieldValue('op');
    switch (operator){
        case 'assign':
            base = 'Assign'
            break;
        case 'add':
	    base = 'Add'
            break;
        case 'sub': 
            base = 'Subtract'
            break;
        case 'mul':
            base = 'Multiply'
            break;
        case 'div':
            base = 'Divide'
            break;
        case 'mod':
            base = 'Modulo'
            break;
        case 'concat':
            base = 'Concatenate'
            break;
    }
    const value = Number(block.getFieldValue('num_value'));
    // option 을 받아와야 bin/oct/hex값 구분할 수 있음.
    var code = base + value
    return [code, vimlangGenerator.PRECEDENCE];
}
