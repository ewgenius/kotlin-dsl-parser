@preprocessor typescript

@builtin "number.ne"
@builtin "string.ne"
@builtin "whitespace.ne"

@{%

type ParsingOuput = any[];
type ParsingArrayOutput = any[][];

%}

##
## Base script structure
##

@{%

export interface KotlinSection {
  name: string;
  body: any[];
};

export type KotlinSectionsDictionary = {
  [name: string]: KotlinSection
};

const sectionsPostProcessor = (d: ParsingArrayOutput) => d[1].reduce<KotlinSectionsDictionary>(
  (dict: KotlinSectionsDictionary, section: KotlinSection) => {
    dict[section.name] = section;
    return dict;
  }, {})

%}

Programm -> _ SectionList _ {% sectionsPostProcessor %}

SectionList -> Section {% d => [d[0]] %}
  | Section _ SectionList  {% d => [d[0], ...d[2]] %}

Section -> BlockSection

##
## Plugins
##

@{%

const pluginsPostProcessor = (d: ParsingArrayOutput) => ({
  name: "plugins",
  plugins: []
});

%}

# PluginsSection -> "plugins" _ "{" _ PluginList _ "}" {% pluginsPostProcessor %}

# PluginList -> Plugin | Plugin _ PluginList

# Plugin -> IdCall

# IdCall -> "id(" string ")"

##
## Block Sections
##

BlockSection -> SectionName _ "{" _ FieldList _ "}" {% d => ({ name: d[0], body: d[4][0]}) %}

SectionName -> Name {% d => d[0] %} | string {% d => d[0][0] %}

FieldList -> null | Field | Field __ FieldList

Field -> Item | Section | Assigment

Item ->  Name | Atom | Chain

##
## Primitives
##

Chain -> ChainSection |  ChainSection "." Chain

ChainSection -> Name | Call

Call -> Name Arguments {% d => ({ name: d[0].name, arguments: d[1] }) %}

Arguments -> "(" ArgumentList ")" {% d => d[1] %}
  | "(" ")" {% d => [] %}

ArgumentList -> Argument | Argument _ "," _ ArgumentList

Argument -> Atom | Assigment

Assigment -> Name _ "=" _ Assigment

Atom ->  number | string

# variables, section names

Name -> _name {% d => d[0] %}

_name -> [a-zA-Z_] {% id %}
	| _name [\w_] {% d => d[0] + d[1] %}

# primitives

string -> dqstring | sqstring | btstring

number -> int | decimal