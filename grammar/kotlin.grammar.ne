@preprocessor typescript

@builtin "number.ne"
@builtin "string.ne"
@builtin "whitespace.ne"

Programm -> _ Sections _ {% d => d[1] %}

Sections -> Section {% d => [d[0]] %}
  | Section _ Sections  {% d => [d[0], ...d[2]] %}

Section -> SectionName _ "{" _ FieldList _ "}" {% d => ({ name: d[0].name, body: d[4][0]}) %}

SectionName -> Name {% d => ({ name: d[0].name }) %}
  | string {% d => ({ name: d[0] }) %}

FieldList -> Field | Field __ FieldList

Field -> Name | Atom | Section | Chain

Chain -> ChainSection {% d => d[0] %}
  |  ChainSection "." Chain {% d => [d[0][0], ...d[2]] %}

ChainSection -> Name | Call

Call -> Name Arguments {% d => ({ name: d[0].name, arguments: d[1] }) %}

Arguments -> "(" ParameterList ")" {% d => d[1] %}
  | "(" ")" {% d => [] %}

ParameterList -> Atom | Atom _ "," _ ParameterList

Atom ->  number | string

Name -> _name {% d => ({ name: d[0]}) %}

_name -> [a-zA-Z_] {% id %}
	| _name [\w_] {% d => d[0] + d[1] %}

# primitives

string -> dqstring | sqstring

number -> int | decimal