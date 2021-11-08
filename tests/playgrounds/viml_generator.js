//import Blockly from 'blockly';
const vimlangGenerator = new Blockly.Generator('Vimlang');

Blockly.Blocks['vim::let'] = {
	init() {
		this.jsonInit({ type: 'vim::let',
			message0: '%1 %2 %3 %4 %5',
			args0: [
				{ name: 'op',
					type: 'field_dropdown',
					options: [
						['Assign', 'assign'],
						['Add', 'add'],
						['Subtract', 'sub'],
						['Multiply', 'mul'],
						['Divide', 'div'],
						['Modulo', 'mod'],
						['Concatenate', 'concat']
					]
				},
				{ name: 'preposition1',
					type: 'field_label_serializable',
					text: 'to'
				},
				{ name: 'var_name',
					type: 'input_value',
					check: 'vim::lvalue'
				},
				{ name: 'preposition2',
					type: 'field_label_serializable',
					text: ''
				},
				{ name: 'rhs',
					type: 'input_value'
				}
			],
			inputsInline: true,
			previousStatement: null,
			nextStatement: null,
			colour: 330,
			tooltip: 'Assign to a variable',
			helpUrl: 'https://vimhelp.org/eval.txt.html#%3Alet',
			mutator: 'vim::let::mutator'
		});
	}
};

// identifier
Blockly.Blocks['vim::ident'] = {
	init() {
		this.jsonInit({ type: 'vim::ident',
			message0: '%1 %2',
			args0: [
				{ name: 'var_ns',
					type: 'field_dropdown',
					options: [
						['(default)', 'def'],
						['argument', 'a'],
						['buffer', 'b'],
						['global', 'g'],
						['local', 'l'],
						['script', 's'],
						['tab page', 't'],
						['window', 'w'],
						['Vim', 'v']
					]
				},
				{ name: 'var_name',
					type: 'field_input',
					text: 'var'
				}
			],
			output: ['vim::lvalue', 'vim::unknown'],
			colour: 180,
			tooltip: 'A variable name',
			helpUrl: 'https://vimhelp.org/eval.txt.html#internal-variables'
		});
		this.getField('var_name').setValidator(is_variable);
	}
};


// literals
Blockly.Blocks['vim::literal::number'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::number',
			message0: '%1 %2',
			args0: [
				{ name: 'num_base',
					type: 'field_dropdown',
					options: [
						['integer', '10'],
						['0b', '2'],
						['0o', '8'],
						['0x', '16']
					]
				},
				{ name: 'num_value',
					type: 'field_input',
					text: '0'
				}
			],
			output: 'vim::number',
			colour: 150,
			tooltip: 'An integer value',
			helpUrl: 'https://vimhelp.org/eval.txt.html#Number'
		});
		this.getField('num_value').setValidator(num_value => {
			const num_base = this.getFieldValue('num_base');
			return {
				2: /^-?[01]+$/,
				8: /^-?[0-7]+$/,
				10: /^-?\d+$/,
				16: /^-?[\da-f]+$/i
			}[num_base].test(num_value)
				? num_value
				: null;
		});
	}
};
Blockly.Blocks['vim::literal::float'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::float',
			message0: 'float %1',
			args0: [
				{ name: 'num_value',
					type: 'field_input',
					text: '0.0'
				}
			],
			output: 'vim::float',
			colour: 150,
			tooltip: 'A floating-point value',
			helpUrl: 'https://vimhelp.org/eval.txt.html#Float'
		});
		this.getField('num_value').setValidator(num_value => (
			/^[-+]?\d+\.\d+(?:e[-+]?\d+)?$/i.test(num_value)
				? num_value
				: null
		));
	}
};
Blockly.Blocks['vim::literal::string'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::string',
			message0: '"%1"',
			args0: [
				{ name: 'str_value',
					type: 'field_input',
					text: ''
				}
			],
			output: 'vim::string',
			colour: 30,
			tooltip: 'A double-quote string',
			helpUrl: 'https://vimhelp.org/eval.txt.html#String'
		});
		this.getField('str_value').setValidator(str_value => (
			/^(?:[^"\\]|\\(?:[^0-7<UuXx]|[0-7]{1,3}|[Xx][\dA-Fa-f]{1,2}|u[\dA-Fa-f]{1,4}|U[\dA-Fa-f]{1,8}|<[^>]+>))*$/
				.test(str_value)
					? str_value
					: null
		));
	}
};
Blockly.Blocks['vim::literal::literal_string'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::literal_string',
			message0: "'%1'",
			args0: [
				{ name: 'str_value',
					type: 'field_input',
					text: ''
				}
			],
			output: 'vim::string',
			colour: 30,
			tooltip: 'A single-quote string without escapes',
			helpUrl: 'https://vimhelp.org/eval.txt.html#literal-string'
		});
		this.getField('str_value').setValidator(str_value => (
			/^(?:[^']|'')*$/.test(str_value)
				? str_value
				: null
		));
	}
};
Blockly.Blocks['vim::literal::blob'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::blob',
			message0: '0z%1',
			args0: [
				{ name: 'byte_value',
					type: 'field_input',
					text: ''
				}
			],
			output: 'vim::blob',
			colour: 30,
			tooltip: 'A binary object',
			helpUrl: 'https://vimhelp.org/eval.txt.html#Blob'
		});
		this.getField('byte_value').setValidator(byte_value => (
			/^(?:[\da-f]{2}(?:\.?[\da-f]{2})*)?$/i.test(byte_value)
				? byte_value
				: null
		));
	}
};
Blockly.Blocks['vim::literal::true'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::true',
			message0: 'True',
			output: ['vim::number', 'vim::special'],
			colour: 240,
			tooltip: 'A true value',
			helpUrl: 'https://vimhelp.org/eval.txt.html#v%3Atrue'
		});
	}
};
Blockly.Blocks['vim::literal::false'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::false',
			message0: 'False',
			output: ['vim::number', 'vim::special'],
			colour: 240,
			tooltip: 'A false value',
			helpUrl: 'https://vimhelp.org/eval.txt.html#v%3Afalse'
		});
	}
};
Blockly.Blocks['vim::literal::none'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::none',
			message0: 'None',
			output: ['vim::number', 'vim::special'],
			colour: 240,
			tooltip: 'A none value',
			helpUrl: 'https://vimhelp.org/eval.txt.html#v%3Anone'
		});
	}
};
Blockly.Blocks['vim::literal::null'] = {
	init() {
		this.jsonInit({ type: 'vim::literal::null',
			message0: 'Null',
			output: ['vim::number', 'vim::special'],
			colour: 240,
			tooltip: 'A null value',
			helpUrl: 'https://vimhelp.org/eval.txt.html#v%3Anull'
		});
	}
};

{ // operators
	{ // precedence 8
		Blockly.Blocks['vim::operator::index'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::index',
					message0: 'item %1 of %2',
					args0: [
						{ name: 'index',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'base',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string', 'vim::list', 'vim::dict', 'vim::blob']
						}
					],
					inputsInline: true,
					// vim::string -> vim::string, vim::blob -> vim::number, * -> vim::unknown
					output: ['vim::lvalue', 'vim::string', 'vim::number', 'vim::unknown'],
					colour: 60,
					tooltip: 'Take an item from n-th position',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%5B%5D'
				});
			}
		};
		Blockly.Blocks['vim::operator::slice'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::slice',
					message0: 'list of %1th to %2th from %3',
					args0: [
						{ name: 'index_from',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'index_to',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'base',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string', 'vim::list', 'vim::blob']
						}
					],
					inputsInline: true,
					// vim::string -> vim::string, vim::blob -> vim::blob, vim::list -> vim::list
					output: ['vim::lvalue', 'vim::string', 'vim::blob', 'vim::list'],
					colour: 60,
					tooltip: 'Take a substring or sublist',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%5B%3A%5D'
				});
			}
		};
		Blockly.Blocks['vim::operator::entry'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::entry',
					message0: 'item %1 of %2',
					args0: [
						{ name: 'index',
							type: 'field_input'
						},
						{ name: 'base',
							type: 'input_value',
							check: ['vim::unknown', 'vim::dict']
						}
					],
					inputsInline: true,
					output: ['vim::lvalue', 'vim::unknown'],
					colour: 60,
					tooltip: 'Take an item by name',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-entry'
				});
				this.getField('index').setValidator(is_key);
			}
		};
		// Blockly.Blocks['vim::operator::call'] = {
			// TODO
		// };
		// Blockly.Blocks['vim::operator::method'] = {
			// TODO
		// };
	}
	{ // precedence 7
		Blockly.Blocks['vim::operator::not'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::not',
					message0: 'not %1',
					args0: [
						{ name: 'base',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						}
					],
					inputsInline: true,
					// vim::float -> vim::float, * -> vim::number
					output: ['vim::float', 'vim::number'],
					colour: 240,
					tooltip: 'Negate a value',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%21'
				});
			}
		};
		Blockly.Blocks['vim::operator::unary_sub'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::unary_sub',
					message0: 'minus %1',
					args0: [
						{ name: 'base',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						}
					],
					inputsInline: true,
					output: ['vim::float', 'vim::number'], // vim::float -> vim::float, * -> vim::number
					colour: 150,
					tooltip: 'Flip the sign of a value',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-unary--'
				});
			}
		};
		Blockly.Blocks['vim::operator::unary_add'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::unary_add',
					message0: 'plus %1',
					args0: [
						{ name: 'base',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						}
					],
					inputsInline: true,
					output: ['vim::float', 'vim::number'], // vim::float -> vim::float, * -> vim::number
					colour: 150,
					tooltip: 'Leave the number unchanged',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-unary-+'
				});
			}
		};
	}
	{ // precedence 6
		Blockly.Blocks['vim::operator::mul'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::mul',
					message0: '%1 × %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						}
					],
					inputsInline: true,
					// includes vim::float -> vim::float, * -> vim::number
					output: ['vim::float', 'vim::number'],
					colour: 150,
					tooltip: 'Multiply numbers',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-star'
				});
			}
		};
		Blockly.Blocks['vim::operator::div'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::div',
					message0: '%1 ÷ %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						}
					],
					inputsInline: true,
					output: ['vim::float', 'vim::number'], // includes vim::float -> vim::float, * -> vim::number
					colour: 150,
					tooltip: 'Divide numbers',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%2F'
				});
			}
		};
		Blockly.Blocks['vim::operator::mod'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::mod',
					message0: '%1 mod %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						}
					],
					inputsInline: true,
					output: 'vim::number',
					colour: 150,
					tooltip: 'Take remainder of division',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%25'
				});
			}
		};
	}
	{ // precedence 5
		Blockly.Blocks['vim::operator::add'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::add',
					message0: '%1 + %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						}
					],
					inputsInline: true,
					// includes vim::float -> vim::float, * -> vim::number
					output: ['vim::float', 'vim::number'],
					colour: 150,
					tooltip: 'Add numbers',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%2B'
				});
			}
		};
		Blockly.Blocks['vim::operator::sub'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::sub',
					message0: '%1 - %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::float', 'vim::string']
						}
					],
					inputsInline: true,
					// includes vim::float -> vim::float, * -> vim::number
					output: ['vim::float', 'vim::number'],
					colour: 150,
					tooltip: 'Subtract numbers',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr--'
				});
			}
		};
		Blockly.Blocks['vim::operator::concat'] = { // .. only, maybe no support for .
			init() {
				this.jsonInit({ type: 'vim::operator::concat',
					message0: '%1 .. %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						}
					],
					inputsInline: true,
					output: 'vim::string',
					colour: 30,
					tooltip: 'Concatenate strings',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-..'
				});
			}
		};
	}
	{ // precedence 4
		Blockly.Blocks['vim::operator::cmp'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::cmp',
					message0: '%1 %2 %3 %4',
					args0: [
						{ name: 'lhs',
							type: 'input_value'
						},
						{ name: 'case',
							type: 'field_dropdown',
							options: [
								['default', ''],
								['case-sensitively', '#'],
								['case-insensitively', '?']
							]
						},
						{ name: 'comparator',
							type: 'field_dropdown',
							options: [
								['==', '=='],
								['!=', '!='],
								['>', '>'],
								['>=', '>='],
								['<', '<'],
								['<=', '<='],
								['match', '=~'],
								['no match', '!~'],
								['same instance', 'is'],
								['different instance', 'isnot']
							]
						},
						{ name: 'rhs',
							type: 'input_value'
						}
					],
					inputsInline: true,
					output: 'vim::number',
					colour: 240,
					tooltip: 'Check if lhs is equal to rhs (follows ignorecase)',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%3D%3D',
					mutator: 'vim::operator::cmp::mutator'
				});
			}
		};
	}
	{ // precedence 3
		Blockly.Blocks['vim::operator::and'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::and',
					message0: '%1 && %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						}
					],
					inputsInline: true,
					output: 'vim::number',
					colour: 240,
					tooltip: 'Check if all terms are true',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-%26%26'
				});
			}
		};
	}
	{ // precedence 2
		Blockly.Blocks['vim::operator::or'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::or',
					message0: '%1 || %2',
					args0: [
						{ name: 'term1',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'term2',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						}
					],
					inputsInline: true,
					output: 'vim::number',
					colour: 240,
					tooltip: 'Check if at least one term is true',
					helpUrl: 'https://vimhelp.org/eval.txt.html#expr-barbar'
				});
			}
		};
	}
	{ // precedence 1
		Blockly.Blocks['vim::operator::trinary'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::trinary',
					message0: '%1 ? %2 : %3',
					args0: [
						{ name: 'control',
							type: 'input_value',
							check: ['vim::unknown', 'vim::number', 'vim::string']
						},
						{ name: 'true',
							type: 'input_value'
						},
						{ name: 'false',
							type: 'input_value'
						}
					],
					inputsInline: true,
					output: 'vim::unknown',
					colour: 240,
					tooltip: 'Select second or third term based on the first term',
					helpUrl: 'https://vimhelp.org/eval.txt.html#trinary'
				});
			}
		};
		Blockly.Blocks['vim::operator::falsy'] = {
			init() {
				this.jsonInit({ type: 'vim::operator::falsy',
					message0: '%1 ?? %2',
					args0: [
						{ name: 'control',
							type: 'input_value'
						},
						{ name: 'fallback',
							type: 'input_value'
						}
					],
					inputsInline: true,
					output: 'vim::unknown',
					colour: 240,
					tooltip: 'Select a term based on the truthiness of first term',
					helpUrl: 'https://vimhelp.org/eval.txt.html#%3F%3F'
				});
			}
		};
	}
}

// comment-out mutator_template-s (temporal)
/*
		mutator_template(
			'vim::let::mutator',
			function(args) {
				const { op } = {
					op: this.getFieldValue('op'),
					...args
				};
				const [preposition1, preposition2, tooltip] = {
					assign: ['to', '', 'Assign to a variable'],
					add: ['to', '', 'Add to a variable'],
					sub: ['from', '', 'Subtract from a variable'],
					mul: ['', 'by', 'Multiply a variable'],
					div: ['', 'by', 'Divide a variable'],
					mod: ['', 'by', 'Take remainder from a variable'],
					concat: ['to', '', 'Concatenate a string to a variable'],
				}[op];
				this.setFieldValue(preposition1, 'preposition1');
				this.setFieldValue(preposition2, 'preposition2');
				this.setTooltip(tooltip);
			},
			'op'
		);
		mutator_template(
			'vim::operator::cmp::mutator',
			function(args) {
				const { case: case_, comparator } = {
					case: this.getFieldValue('case'),
					comparator: this.getFieldValue('comparator'),
					...args
				};
				const comp_tooltip = {
					'==': 'is equal to',
					'!=': 'is not equal to',
					'>': 'is greater than',
					'>=': 'is greater than or equal to',
					'<': 'is less than',
					'<=': 'is less than or equal to',
					'=~': 'matches',
					'!~': 'does not match',
					'is': 'is the same instance to',
					'isnot': 'is not the same instance to'
				}[comparator];
				const case_tooltip = {
					'': 'follows ignorecase',
					'#': 'case sensitively',
					'?': 'case insensitively'
				}[case_];
				const token = `${comparator}${case_}`;
				this.setTooltip(`Check if lhs ${comp_tooltip} rhs (${case_tooltip})`);
				this.setHelpUrl(`https://vimhelp.org/eval.txt.html#expr-${encodeURIComponent(token)}`);
			},
			'case', 'comparator'
		);
		called = true;
	}

})();
*/
const toolbox = {
	kind: 'categoryToolbox',
	contents: [
		{ name: 'Command',
			kind: 'category',
			contents: [
				{
					kind: 'block',
					type: 'vim::let'
				}
			],
			colour: 330
		},
		{ name: 'Value',
			kind: 'category',
			contents: [
				{
					kind: 'block',
					type: 'vim::literal::number'
				},
				{
					kind: 'block',
					type: 'vim::literal::float'
				},
				{
					kind: 'block',
					type: 'vim::literal::string'
				},
				{
					kind: 'block',
					type: 'vim::literal::literal_string'
				},
				{
					kind: 'block',
					type: 'vim::literal::blob'
				},
				{
					kind: 'block',
					type: 'vim::literal::true'
				},
				{
					kind: 'block',
					type: 'vim::literal::false'
				},
				{
					kind: 'block',
					type: 'vim::literal::none'
				},
				{
					kind: 'block',
					type: 'vim::literal::null'
				}
			],
			colour: 180,
		},
		{ name: 'Arithmetic',
			kind: 'category',
			contents: [
				{
					kind: 'block',
					type: 'vim::operator::add'
				},
				{
					kind: 'block',
					type: 'vim::operator::sub'
				},
				{
					kind: 'block',
					type: 'vim::operator::mul'
				},
				{
					kind: 'block',
					type: 'vim::operator::div'
				},
				{
					kind: 'block',
					type: 'vim::operator::mod'
				},
				{
					kind: 'block',
					type: 'vim::operator::unary_add'
				},
				{
					kind: 'block',
					type: 'vim::operator::unary_sub'
				}
			],
			colour: 150,
		},
		{ name: 'Logic',
			kind: 'category',
			contents: [
				{
					kind: 'block',
					type: 'vim::operator::cmp'
				},
				{
					kind: 'block',
					type: 'vim::operator::and'
				},
				{
					kind: 'block',
					type: 'vim::operator::or'
				},
				{
					kind: 'block',
					type: 'vim::operator::not'
				},
				{
					kind: 'block',
					type: 'vim::operator::trinary'
				},
				{
					kind: 'block',
					type: 'vim::operator::falsy'
				},
			],
			colour: 240,
		},
		{ name: 'String',
			kind: 'category',
			contents: [
				{
					kind: 'block',
					type: 'vim::operator::concat'
				}
			],
			colour: 30,
		},
		{ name: 'List & Dict',
			kind: 'category',
			contents: [
				{
					kind: 'block',
					type: 'vim::operator::index'
				},
				{
					kind: 'block',
					type: 'vim::operator::entry'
				},
				{
					kind: 'block',
					type: 'vim::operator::slice'
				}
			],
			colour: 60
		},
		{ name: 'Variable',
			kind: 'category',
			contents: [
				{
					kind: 'block',
					type: 'vim::ident'
				}
			],
			colour: 180,
		}
	]
};

//export { init, toolbox };