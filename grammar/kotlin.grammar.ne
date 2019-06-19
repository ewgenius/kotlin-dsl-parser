@preprocessor typescript

@{%

const moo = require("moo");

const rules = {

};

const lexer = moo.states({
  main: {
    ws: { match: /[ \t\n]+/, lineBreaks: true },
    comment: { match: /\/\/.+$/, next: "main" },
    number:  { match: /0|[1-9][0-9]*/, next: "main" },
    string:  { match: /["|`|'](?:\\["\\]|[^\n"\\])*["|`|']/, next: "main" },
    null: { match: 'null', next: "main" },
    "{": { match: "{", next: "main" },
    "}": { match: "}", next: "main" },
    "(": { match: "(", next: "main" },
    ")": { match: ")", next: "main" },
    ",": { match: ",", next: "main" },
    "=": { match: "=", next: "main" },
    identifier: { match: /[a-zA-Z_][a-zA-Z0-9_\.]*/, next: "main" }
  }
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
    console.log(debug, d[a], d[b]);
  }
  return [...d[a], ...d[b]];
}

const concatToArray = (a: number, b: number, debug?: string) => (d: any[][]) => {
  if (debug) {
    console.log(debug, d[a], d[b]);
  }
  return [d[a], ...d[b]];
}

const scriptPostProcess = (d: any[][]) => d[1].reduce<KotlinBlocksDictionary>((dict: KotlinBlocksDictionary, section: KotlinBlock) => {
  dict[section.block] = section;
  return dict;
}, {})

%}

@lexer lexer

Script -> _ Blocks _ {% scriptPostProcess %}

Blocks -> Block | Block _ Blocks {% concatToArray(0, 2) %}

Block -> BlockName _ "{" _ Fields _ "}" {% d => ({ block: d[0], body: d[4] }) %}

BlockName -> String {% id %}
           | Identifier {% id %}

Fields -> null | Field | Field __ Fields {% concatToArray(0, 2) %}

Field -> String {% id %}
       | Identifier {% id %}
       | Function {% id %}
       | Block {% id %}
       | Declaration {% id %}
       | Comment {% id %}

Function -> Identifier "(" _ Arguments _ ")" {% d => ({ function: d[0], arguments: d[3] }) %}

Arguments -> null | Argument | Argument _ "," _ Arguments {% concatToArray(0, 4) %}

Argument -> Number {% id %}
          | String {% id %}
          | Identifier {% id %}
          | Declaration {% id %}

Declaration -> Identifier _ "=" _ Expression {% d => ({ declaration: d[0], value: d[4][0] }) %}

Expression -> ( Argument | Function ) {% id %}

# Primitives

Number -> %number {% d => Number(d[0].value) %}

String -> %string {% d => {
    if (d[0].value[0] === '"' || d[0].value[0] === '`' || d[0].value[0] === "'") {
      return d[0].value.slice(1, d[0].value.length - 1);
    }
    return d[0].value;
  }
%}

Identifier -> %identifier {% d => d[0].value %}

Comment -> %comment {% d => null %}

_ -> _ws {% d => null %} | _ws %comment _ws {% d => null %}

_ws -> null {% d => null %} | %ws {% d => null %}

__ -> %ws {% d => null %}
