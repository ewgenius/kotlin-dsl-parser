@preprocessor typescript

@builtin "number.ne"
@builtin "string.ne"
@builtin "whitespace.ne"

@{%

const moo = require("moo");

const lexer = moo.compile({
  ws: /[ \t]+/,
  number: /[0-9]+/,
  word: /[a-zA-Z_][a-zA-Z0-9_\.]+/,
  "{": "{",
  "}": "}",
  "(": "(",
  ")": ")",
});

%}

@lexer lexer

#
# Utils
#

@{%

const nth = (n: number) => (d: any[]) => d[n];

const nthArray = (n: number, debug?: string) => (d: any[]) => {
  if (debug) {
    console.log(d, debug);
  }
  return [d[n]];
};

const emptyArray = () => [];

const concatArray = (a: number, b: number, debug?: string) => (d: any[]) => {
  if (debug) {
    console.log(d, d[a], d[b], debug);
  }
  return [...d[a], ...d[b]]
};

%}

#
# Basic Program structure
#

@{%

export interface KotlinSection {
  name: string;
  body: any[];
};

export type KotlinSectionsDictionary = {
  [name: string]: KotlinSection
};

const programmPostProcessor = (d: any[][]) => d[1].reduce<KotlinSectionsDictionary>((dict: KotlinSectionsDictionary, section: KotlinSection) => {
  dict[section.name] = section;
  return dict;
}, {})

%}

Programm -> _ Sections _ {% programmPostProcessor %}

Sections -> SectionItem:+ {% id %}

SectionItem -> Section _ {% id %}

@{%

interface Section {
  name: string;
  body: Field[];
}

type Field = "string";

const sectionPostProcessor = (d: any[]) => ({
  name: d[0],
  body: d[4]
} as Section);

const emptySectionPostProcessor = (d: any[]) => ({
  name: d[0],
  body: []
} as Section);

%}

Section -> SectionName _ "{" _ FieldList _ "}" {% sectionPostProcessor %}
         | SectionName _ "{" _ "}" {% emptySectionPostProcessor %}

SectionName -> literal {% id %}
             | string {% id %}

FieldList -> Field
           | Field __ FieldList {% concatArray(0, 2) %}

Field -> ( ( literal wchar ) | Atom | Call | Assigment | Section) {% id %}

# Function calls

Call -> literal "(" _ ArgumentList _ ")" {% d => ({ call: d[0], arguments: d[3] }) %}
      | literal "(" _ ")" {% d => ({ call: d[0], arguments: [] }) %}

Caller -> literal {% id %}

ArgumentList -> Argument
              | Argument _ "," _ ArgumentList {% concatArray(0, 4, "FieldList") %}

Argument -> Atom {% id %}
          | Assigment {% id %}

# Operations

Assigment -> literal _ "=" _ Atom {% d => ({ a: d[0], b: d[2] }) %}

Atom -> number {% id %}
      | string {% id %}

#
# Names
#

literal -> %word {% id %}

chain -> _literal | _literal "." chain {% d => d.join("") %}

_literal -> [a-zA-Z_] [a-zA-Z_0-9]:* {% d => d[0] + d[1].join("") %}


#
# primitives
#

string -> dqstring {% id %}
        | sqstring {% id %}
        | btstring {% id %}

wchar -> ( __ | "." | "(" | ")" | "{" | "}" ) {% id %}

number -> int | decimal