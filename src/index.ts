import * as fs from "fs";
import * as path from "path";
import * as moo from "moo";
import { Rule, Token } from "moo";

enum Type {
  WS = "WS",
  comment = "comment",
  number = "number",
  string = "string",
  NL = "NL",
  identifier = "identifier",

  PluginId = "pluginId",
  AndroidPlugin = "com.android.application"
}

type RulesDictionary = {
  [key: string]: Rule;
};

enum State {
  Root = "root",
  Plugins = "plugins",
  BuildTypes = "buildTypes",
  ProductFlavors = "productFlavors"
}

const keyword = ["(", ")", "{", "}", "=", ","];

const baseRules: RulesDictionary = {
  [Type.WS]: { match: /[ \t]+/ },
  [Type.comment]: { match: /\/\/.*?$/ },
  [Type.number]: { match: /0|[1-9][0-9]*/ },
  [Type.string]: { match: /["|'|`](?:\\["\\]|[^\n"\\])*["|'|`]/ },
  [Type.NL]: { match: /\n/, lineBreaks: true },
  [Type.identifier]: { match: /[a-zA-Z_][a-zA-Z0-9_\.<>]*/ }
};

const mainRules: RulesDictionary = {
  plugins: { match: /plugins[ *]{/, push: State.Plugins },
  buildTypes: { match: /buildTypes[ *]{/, push: State.BuildTypes },
  productFlavors: { match: /productFlavors[ *]{/, push: State.ProductFlavors }
};

const pluginRules: RulesDictionary = {
  [Type.AndroidPlugin]: { match: "com.android.application" }
};

const blockRules = (push: State): RulesDictionary => {
  return {
    "{": { match: "{", push },
    "}": { match: "}", pop: 1 }
  };
};

const extendRules = (rules: RulesDictionary, next: State) => {
  return Object.keys(rules).reduce((extended: RulesDictionary, key: string) => {
    extended[key] = {
      ...rules[key],
      next
    };
    return extended;
  }, {});
};

const lexer = moo.states({
  [State.Root]: {
    ...mainRules,
    ...extendRules(baseRules, State.Root),
    keyword
  },
  [State.Plugins]: {
    ...blockRules(State.Plugins),
    ...extendRules(pluginRules, State.Plugins),
    ...extendRules(baseRules, State.Plugins),
    keyword
  },
  [State.BuildTypes]: {
    ...blockRules(State.BuildTypes),
    ...extendRules(baseRules, State.BuildTypes),
    keyword
  },
  [State.ProductFlavors]: {
    ...blockRules(State.ProductFlavors),
    ...extendRules(baseRules, State.ProductFlavors),
    keyword
  }
});

const input = fs.readFileSync(
  path.resolve(__dirname, "../__tests__/fixtures/build.gradle.kts"),
  "utf8"
);
lexer.reset(input);

console.log(lexer.save());
let token = lexer.next();
while (token) {
  const state = lexer.save();
  switch (token.type as Type) {
    case Type.identifier: {
      console.log(`#${state.line}:${state.col} - ${state.state} : ${token.value}`);
      break;
    }
    default: {
      console.log(`#${state.line}:${state.col} - ${state.state}`);
    }
  }
  token = lexer.next();
}
