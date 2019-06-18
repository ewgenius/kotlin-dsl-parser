@preprocessor typescript

@{%

const moo = require("moo");

const lexer = moo.compile({
  ws: { match: /[ \t\n]+/, lineBreaks: true },
  number:  /0|[1-9][0-9]*/,
  string:  /"(?:\\["\\]|[^\n"\\])*"/,
  true: 'true',
  false: 'false',
  null: 'null',
  "{": "{",
  "}": "}",
  "(": "(",
  ")": ")",
  identifier: /[a-zA-Z_][a-zA-Z0-9_\.]*/,
});

export interface KotlinBlock {
  block: string;
  body: any[];
};

export type KotlinBlocksDictionary = {
  [name: string]: KotlinBlock
};

const concatArrays = (a: number, b: number, debug?: string) => (d: any[][]) => {
  if (debug) {
    console.log(debug, d);
  }
  return [...d[a], ...d[b]];
}

const concatToArray = (a: number, b: number, debug?: string) => (d: any[][]) => {
  if (debug) {
    console.log(debug, d);
  }
  return [d[a], ...d[b]];
}

const scriptPostProcess = (d: any[][]) => d[1].reduce<KotlinBlocksDictionary>((dict: KotlinBlocksDictionary, section: KotlinBlock) => {
  dict[section.block] = section;
  return dict;
}, {})

%}

@lexer lexer

Script -> _ null _ {% () => ({}) %} 
        | _ Blocks _ {% scriptPostProcess %}

Blocks -> Block | Block _ Blocks {% concatToArray(0, 2) %}

Block -> BlockName _ "{" _ Fields _ "}" {% d => ({ block: d[0], body: d[4] }) %}

BlockName -> String {% id %}
           | Identifier {% id %}

Fields -> null | Field | Field _ Fields {% concatArrays(0, 2)  %}

Field -> ( String | Identifier | Function | Block ) {% id %}

Function -> Identifier "(" _ Arguments _ ")" {% d => ({ function: d[0], arguments: d[3] }) %}

Arguments -> null | Argument | Argument _ "," _ Arguments {% concatArrays(0, 4) %}

Argument -> Number {% id %}
          | String {% id %}
          | Identifier {% id %}

# Primitives

Number -> %number {% d => d[0].value %}

String -> %string {% d => {
    if (d[0].value.startsWith(`"`)) {
      return d[0].value.slice(1, d[0].value.length - 1);
    }
    return d[0].value;
  }
%}

Identifier -> %identifier {% d => d[0].value %}

_ -> null | %ws {% d => null %}

__ -> %ws {% d => null %}
