@preprocessor typescript

@{%

const moo = require("moo");

const rules = {

};

const lexer = moo.states({
  main: {
    ws: { match: /[ \t\n]+/, lineBreaks: true },
    comment: { match: /\/\/.+$/, lineBreaks: true, next: "main" },
    multicomment: { match: /\/\*.+\*\//, next: "main" },
    number:  { match: /0|[1-9][0-9]*/, next: "main" },
    string:  { match: /["|`|'](?:\\["\\]|[^\n"\\])*["|`|']/, next: "main" },
    null: { match: 'null', next: "main" },
    "{": { match: "{", next: "main" },
    "}": { match: "}", next: "main" },
    "(": { match: "(", next: "main" },
    ")": { match: ")", next: "main" },
    ",": { match: ",", next: "main" },
    "=": { match: "=", next: "main" },
    "/*": { match: "/*", next: "main" },
    "*/": { match: "*/", next: "main" },
    identifier: { match: /[a-zA-Z_][a-zA-Z0-9_\.<>]*/, next: "main" }
  }
});

export interface KotlinBlock {
  name: string;
  type: string;
  body: any[];
};

export type KotlinBlocksDictionary = {
  [name: string]: KotlinBlock
};

const concatToArray = (a: number, b: number, debug?: string) => (d: any[][]) => {
  if (debug) {
    console.log(debug, d[a], d[b]);
  }
  return [d[a], ...d[b]];
}

const scriptPostProcess = (d: any[][]) => d[1].reduce<KotlinBlocksDictionary>((dict: KotlinBlocksDictionary, section: KotlinBlock) => {
  dict[section.name] = section;
  return dict;
}, {})

%}

@lexer lexer

Script -> _ Blocks _ {% scriptPostProcess %}

Blocks -> Block | Block _ Blocks {% concatToArray(0, 2) %}

Block -> BlockName _ "{" _ Fields _ "}" {% d => ({ name: d[0], type: "block", body: d[4] }) %}
       | BlockName _ "{" _ "}" {% d => ({ name: d[0], type: "block", body: [] }) %}
       | BlockName _ "(" _ Arguments _ ")" {% d => ({ name: d[0], type: "function", arguments: d[4] }) %}

BlockName -> String {% id %}
           | Identifier {% id %}
           | Identifier _ "(" _ String _ ")" {% d => d[4] %}

Fields -> Field | Field __ Fields {% concatToArray(0, 2) %}

Field -> String {% id %}
       | Identifier {% id %}
       | Block {% id %}
       | Declaration {% id %}

Function -> BlockName _ "(" _ Arguments _ ")" {% d => ({ name: d[0], type: "function", arguments: d[4] }) %}

Arguments -> null | Argument | Argument _ "," _ Arguments {% concatToArray(0, 4) %}

Argument -> Number {% id %}
          | String {% id %}
          | Identifier {% id %}
          | Declaration {% id %}

Declaration -> Identifier _ "=" _ Expression {% d => ({ declaration: d[0], value: d[4] }) %}

Expression -> Argument {% id %}
            | Function {% id %}

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

_ -> _ws {% d => null %} | Comments:+ _ws {% d => null %}

__ -> %ws {% d => null %} | Comments:+ _ws {% d => null %}

Comments -> Comment {% d => null %}
          | MultilineComment {% d => null %}

MultilineComment -> _ws %multicomment {% d => null %}

Comment -> _ws %comment {% d => null %}

_ws -> null {% d => null %} | %ws {% d => null %}
