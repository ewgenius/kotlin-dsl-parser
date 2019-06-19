// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var number: any;
declare var string: any;
declare var identifier: any;
declare var ws: any;
declare var comment: any;


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


export interface Token { value: any; [key: string]: any };

export interface Lexer {
  reset: (chunk: string, info: any) => void;
  next: () => Token | undefined;
  save: () => any;
  formatError: (token: Token) => string;
  has: (tokenType: string) => boolean
};

export interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any
};

export type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

export var Lexer: Lexer | undefined = lexer;

export var ParserRules: NearleyRule[] = [
    {"name": "Script", "symbols": ["_", "Blocks", "_"], "postprocess": scriptPostProcess},
    {"name": "Blocks", "symbols": ["Block"]},
    {"name": "Blocks", "symbols": ["Block", "_", "Blocks"], "postprocess": concatToArray(0, 2)},
    {"name": "Block", "symbols": ["BlockName", "_", {"literal":"{"}, "_", "Fields", "_", {"literal":"}"}], "postprocess": d => ({ name: d[0], type: "block", body: d[4] })},
    {"name": "Block", "symbols": ["BlockName", "_", {"literal":"{"}, "_", {"literal":"}"}], "postprocess": d => ({ name: d[0], type: "block", body: [] })},
    {"name": "Block", "symbols": ["BlockName", {"literal":"("}, "_", "Arguments", "_", {"literal":")"}], "postprocess": d => ({ name: d[0], type: "function", arguments: d[3] })},
    {"name": "BlockName", "symbols": ["String"], "postprocess": id},
    {"name": "BlockName", "symbols": ["Identifier"], "postprocess": id},
    {"name": "Fields", "symbols": ["Field"]},
    {"name": "Fields", "symbols": ["Field", "__", "Fields"], "postprocess": concatToArray(0, 2)},
    {"name": "Field", "symbols": ["String"], "postprocess": id},
    {"name": "Field", "symbols": ["Identifier"], "postprocess": id},
    {"name": "Field", "symbols": ["Block"], "postprocess": id},
    {"name": "Field", "symbols": ["Declaration"], "postprocess": id},
    {"name": "Function", "symbols": ["BlockName", {"literal":"("}, "_", "Arguments", "_", {"literal":")"}], "postprocess": d => ({ name: d[0], type: "function", arguments: d[3] })},
    {"name": "Arguments", "symbols": []},
    {"name": "Arguments", "symbols": ["Argument"]},
    {"name": "Arguments", "symbols": ["Argument", "_", {"literal":","}, "_", "Arguments"], "postprocess": concatToArray(0, 4)},
    {"name": "Argument", "symbols": ["Number"], "postprocess": id},
    {"name": "Argument", "symbols": ["String"], "postprocess": id},
    {"name": "Argument", "symbols": ["Identifier"], "postprocess": id},
    {"name": "Argument", "symbols": ["Declaration"], "postprocess": id},
    {"name": "Declaration", "symbols": ["Identifier", "_", {"literal":"="}, "_", "Expression"], "postprocess": d => ({ declaration: d[0], value: d[4] })},
    {"name": "Expression", "symbols": ["Argument"], "postprocess": id},
    {"name": "Expression", "symbols": ["Function"], "postprocess": id},
    {"name": "Number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => Number(d[0].value)},
    {"name": "String", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess":  d => {
          if (d[0].value[0] === '"' || d[0].value[0] === '`' || d[0].value[0] === "'") {
            return d[0].value.slice(1, d[0].value.length - 1);
          }
          return d[0].value;
        }
        },
    {"name": "Identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": d => d[0].value},
    {"name": "_", "symbols": ["_ws"], "postprocess": d => null},
    {"name": "_$ebnf$1", "symbols": ["Comments"]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "Comments"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1", "_ws"], "postprocess": d => null},
    {"name": "__", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": d => null},
    {"name": "__$ebnf$1", "symbols": ["Comments"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "Comments"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "__", "symbols": ["__$ebnf$1", "_ws"], "postprocess": d => null},
    {"name": "Comments", "symbols": ["_ws", (lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": d => null},
    {"name": "Comment", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": d => null},
    {"name": "_ws", "symbols": [], "postprocess": d => null},
    {"name": "_ws", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": d => null}
];

export var ParserStart: string = "Script";
