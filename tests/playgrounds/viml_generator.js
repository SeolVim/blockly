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

vimlangGenerator['vim::let'] = function(block) {
    let operator = block.getFieldValue('op');
    switch (operator){
        case 'assign':
            operator = 'Assign'
            break;
        case 'add':
	    operator = 'Add'
            break;
        case 'sub': 
            operator = 'Subtract'
            break;
        case 'mul':
            operator = 'Multiply'
            break;
        case 'div':
            operator = 'Divide'
            break;
        case 'mod':
            operator = 'Modulo'
            break;
        case 'concat':
            operator = 'Concatenate'
            break;
    }
    operator = String(operator)
    // option 을 받아와야 bin/oct/hex값 구분할 수 있음.
    return [operator, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::ident'] = function(block) {
    let code = block.getFieldValue('var_ns');    // gets Json values from k:v
    let varName = block.getFieldValue('var_name');
    code = code + ':' + varName;
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::add'] = function(block) {
    let term1 = vimlangGenerator.valueToCode(block, 'term1', 
		    vimlangGenerator.PRECEDENCE);
    let term2 = vimlangGenerator.valueToCode(block, 'term2', 
		    vimlangGenerator.PRECEDENCE);
    code = term1 + ' + ' + term2;
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::sub'] = function(block) {
    let term1 = vimlangGenerator.valueToCode(block, 'term1', 
		    vimlangGenerator.PRECEDENCE);
    let term2 = vimlangGenerator.valueToCode(block, 'term2', 
		    vimlangGenerator.PRECEDENCE);
    code = term1 + ' - ' + term2;
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::mul'] = function(block) {
    let term1 = vimlangGenerator.valueToCode(block, 'term1', 
		    vimlangGenerator.PRECEDENCE);
    let term2 = vimlangGenerator.valueToCode(block, 'term2', 
		    vimlangGenerator.PRECEDENCE);
    code = term1 + ' * ' + term2;
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::div'] = function(block) {
    let term1 = vimlangGenerator.valueToCode(block, 'term1', 
		    vimlangGenerator.PRECEDENCE);
    let term2 = vimlangGenerator.valueToCode(block, 'term2', 
		    vimlangGenerator.PRECEDENCE);
    code = term1 + ' / ' + term2;
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::mod'] = function(block) {
    let term1 = vimlangGenerator.valueToCode(block, 'term1', 
		    vimlangGenerator.PRECEDENCE);
    let term2 = vimlangGenerator.valueToCode(block, 'term2', 
		    vimlangGenerator.PRECEDENCE);
    code = term1 + ' % ' + term2;
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::unary_add'] = function(block) {
    let code = vimlangGenerator.valueToCode(block, 'base', 
		    vimlangGenerator.PRECEDENCE);
    code = '(+' + code + ')'
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::unary_sub'] = function(block) {
    let code = vimlangGenerator.valueToCode(block, 'base', 
		    vimlangGenerator.PRECEDENCE);
    code = '(+' + code + ')'
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::concat'] = function(block) {
    let term1 = vimlangGenerator.statementToCode(block, 'term1') || '0';
    let term1_noindent = term1.trim();
    let term2 = vimlangGenerator.statementToCode(block, 'term2') || '0';
    let term2_noindent = term2.trim();
    code = term1_noindent + '..' + term2_noindent;
    return [code, vimlangGenerator.PRECEDENCE];
}

vimlangGenerator['vim::operator::cmp'] = function(block) {
    let lhs = vimlangGenerator.valueToCode(block, 'lhs', 
                              vimlangGenerator.PRECEDENCE);
    let rhs = vimlangGenerator.valueToCode(block, 'rhs', 
                              vimlangGenerator.PRECEDENCE);
    let _case = block.getFieldValue('case');
    let comp = block.getFieldValue('comparator');
    let code;
    switch (_case){
        case '':
	    _case = ''
            break;
        case '#':
	    _case = '#'
            break;
        case '?':
	    _case = '?'
            break;
    }
    
    switch (comp){
        case '==':
            comp = '=='
	    break;
        case '!=':
            comp = '!='
	    break;
        case '>':
            comp = '>'
	    break;
        case '>=':
            comp = '>='
	    break;
        case '<':
            comp = '<'
	    break;
        case '<=':
            comp = '<='
	    break;
        case '=~':
            comp = '=~'
	    break;
        case '!~':
            comp = '!~'
	    break;
        case 'is':
            comp = 'is'
	    break;
        case 'isnot':
            comp = 'isnot'
	    break;
    }
    code = lhs + ' ' + comp + _case  + ' ' + rhs; 
    return [code, vimlangGenerator.PRECEDENCE];
}

