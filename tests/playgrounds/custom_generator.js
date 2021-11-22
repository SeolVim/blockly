/*
 * Author: SangJin Lee  * Source from: https://blocklycodelabs.dev/codelabs/custom-generator/index.html?index=..%2F..index#1
 */

/*
 * 2개의 user defined block, 그리고 Blockly standard set에서 5개 block을 사용함.
 */
//goog.provide('Blockly.Json'); // goog.provide(): google closure library로 등록 (이건 Blockly 의 Json이라는 라이브러리로 등록할거임)

//goog.require('Blockly.Generator'); // goog.require(): google closure library에서 가져옴 (여기에서는 이게 필요해)
//goog.require('Blockly.inputTypes');
//goog.require('Blockly.utils.string');

// 커스텀 generator 등록
const codelabGenerator = new Blockly.Generator('Json');

Blockly.defineBlocksWithJsonArray([{
  "type": "object",
  "message0": "{ %1 %2 }",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "MEMBERS"
    }
  ],
  "output": null,
  "colour": 230,
},
{
  "type": "member",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "MEMBER_NAME",
      "text": ""
    },
    {
      "type": "field_label",
      "name": "COLON",
      "text": ":"
    },
    {
      "type": "input_value",
      "name": "MEMBER_VALUE"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
}]);

// XML형태로 기본제공되는 block들을 정의해 넣음.
var codelabToolbox = `
<xml id="toolbox" style="display: none">
<block type="object"/>
<block type="member"></block>
<block type="math_number"><field name="NUM">0</field></block>
<block type="text"><field name="TEXT"/></block>
<block type="logic_boolean"><field name="BOOL">TRUE</field></block>
<block type="logic_null"/>
<block type="lists_create_with"><mutation items="3"/></block>
</xml>
`
// JSON은 우선순위를 따지지 않음 (그래서 그냥 PRECEDENCE로 = 0으로 퉁치자)
codelabGenerator.PRECEDENCE = 0;

/** value block은 getFieldValue()를 사용해서 값을 반환한다. **/
// getFieldValue()에는 파라미터로 필드 이름이 들어감.
// 필드 이름은 JSON이나 XML로 명시되어있어야 함.
// null: value block
codelabGenerator['logic_null'] = function(block) {
    return ['null', codelabGenerator.PRECEDENCE];
};

// string: value block
codelabGenerator['text'] = function(block) {
    var textValue = block.getFieldValue('TEXT');
    var code = '"' + textValue + '"';
    return [code, codelabGenerator.PRECEDENCE];
};

// number: value block
codelabGenerator['math_number'] = function(block) {
    const code = Number(block.getFieldValue('NUM'));
    return [code, codelabGenerator.PRECEDENCE];
};

// logical bool: value block
codelabGenerator['logic_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
    return [code, codelabGenerator.PRECEDENCE];
};

// code-generator for member block
// 멤버블록은 property name: "property value" 의 형태로 이루어짐
codelabGenerator['member'] = function(block) {
    const name = block.getFieldValue('MEMBER_NAME');
    const value = codelabGenerator.valueToCode(block, 'MEMBER_VALUE'
        , codelabGenerator.PRECEDENCE);
    // valueToCode는 연결된 블록을 찾고
    // 해당 블록에 대한 코드를 생성하고
    // 생성된 코드를 string으로 반환함. (연결된 블록이 없으면 null반환)
    // 물론 맞닿은 블록이 없는 경우에는 기본값을 바꾸어 주어야 할 경우 생김.
    const code = '"' + name + '": ' + value;
    return code;
};

// code-generator for array block
// array 블록은 input value를 ADD0, ADD1과 같은 형태로 받아들임.
// codelabGenerator.valueToCode()를 사용함.
/* 원하는 결과 형태는 아래와 같음.
[
  1,
  "two",
  false,
  true
]
*/
codelabGenerator['lists_create_with'] = function(block) {
    const values = [];
    for (var i=0; i<block.itemCount_; i++){
        // let valueCode = codelabGenerator.valueToCode(block, 'ADD' + i, codelabGenerator.PRECEDENCE) || null; 을 사용해도 ok
        let valueCode = codelabGenerator.valueToCode(block, 'ADD' + i, codelabGenerator.PRECEDENCE);
        if (valueCode) {
            values.push(valueCode);
        }
    }
    // 위 과정을 끝내면 values 에는 generate된 코드들(string)이 담기게 됨.
    // 하나의 string으로 바꾸어야 하네.
    let valueString = values.join(',\n');
    // 우리가 json작성할 때 생각해보면, array에는 indentation 필요했으니까.
    const indentedValueString = codelabGenerator.prefixLines(valueString, codelabGenerator.INDENT) // @text;string @prefix;string INDENT는 attribute임 2개 space가 기본값
    const codeString = '[\n' + indentedValueString + '\n]';
    return [codeString, codelabGenerator.PRECEDENCE];
}

//code-generator for object block
/* 원하는 결과 형태는 아래와 같음.
{
  "a": true,
  "b": "one",
  "c": 1
}
*/
codelabGenerator['object'] = function(block) {
    const statement_members = codelabGenerator.statementToCode(block, 'MEMBERS'); //두번째 @param에 연결된 블록들을 찾아서 바꾸고 str로 반환

    // statementToCode는 연결된 블록을 찾고
    // 해당 블록에 대한 코드를 생성하고
    // 생성된 코드를 string으로 반환함. (연결된 블록이 없으면 null반환)
    // 물론 맞닿은 블록이 없는 경우에는 기본값을 바꾸어 주어야 할 경우 생김.

    const code = '{' + '\n' + statement_members + '\n' + '}';
    return [code, codelabGenerator.PRECEDENCE];
};

// stack 생성
// scrub_ 함수를 사용할 것임. param은 다음과 같음
// @block_: 현재 블록
// @code: 붙어있는 모든 value block들을 코드로 바꾼 string들과 현재 블록을 코드로 바꾼 string
// @_opt_thisOnly: optional boolean 값. true이면, 붙어있는 블록들을 뺀 현재 블록만 코드가 생성됨
// scrub_ 함수는 모든 블록에서 호출될 수 있는 (generator 내장)함수임.
codelabGenerator.scrub_ = function(block, code, opt_thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  let nextCode = '';
  if(nextBlock) {
    nextCode = opt_thisOnly ? "" : ',\n' + codelabGenerator.blockToCode(nextBlock);
  }
  return code + nextCode;
};
