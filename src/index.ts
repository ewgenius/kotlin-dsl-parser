import * as fs from "fs";
import * as path from "path";
import * as moo from "moo";
import chalk from "chalk";
import { Rule } from "moo";

const inspectMemory = () => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The script uses approximately ${Math.round(used * 100) / 100} MB`
  );
};

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
  BuildTypeDeclaration = "buildTypeDeclaration",
  ProductFlavors = "productFlavors",
  ProductFlavorDeclaration = "ProductFlavorDeclaration"
}

const keyword = ["(", ")", "{", "}", "=", ","];

const baseRules: RulesDictionary = {
  [Type.WS]: { match: /[ \t]+/ },
  [Type.comment]: { match: /\/\/.*?$/ },
  [Type.number]: { match: /0|[1-9][0-9]*/ },
  [Type.string]: {
    match: /["|'|`](?:\\["\\]|[^\n"\\])*["|'|`]/,
    value: x => x.slice(1, -1)
  },
  [Type.NL]: { match: /\n/, lineBreaks: true },
  [Type.identifier]: { match: /[a-zA-Z_][a-zA-Z0-9_\.<>]*/ }
};

const mainRules: RulesDictionary = {
  plugins: { match: /plugins *{/, push: State.Plugins },
  buildTypes: { match: /buildTypes *{/, push: State.BuildTypes },
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

const parentesisRules = (push: State): RulesDictionary => {
  return {
    "(": { match: "(", push },
    ")": { match: ")", pop: 1 }
  };
};

const declarationRules = (push: State): RulesDictionary => {
  return {
    getByName: { match: /getByName *\(/, push },
    create: { match: /create *\(/, push }
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
    ...declarationRules(State.BuildTypeDeclaration),
    ...blockRules(State.BuildTypes),
    ...extendRules(baseRules, State.BuildTypes),
    keyword
  },
  [State.BuildTypeDeclaration]: {
    ...blockRules(State.BuildTypeDeclaration),
    ...parentesisRules(State.BuildTypeDeclaration),
    ...extendRules(baseRules, State.BuildTypeDeclaration),
    keyword
  },
  [State.ProductFlavors]: {
    ...declarationRules(State.ProductFlavorDeclaration),
    ...blockRules(State.ProductFlavors),
    ...extendRules(baseRules, State.ProductFlavors),
    keyword
  },
  [State.ProductFlavorDeclaration]: {
    ...parentesisRules(State.ProductFlavorDeclaration),
    ...blockRules(State.ProductFlavorDeclaration),
    ...extendRules(baseRules, State.ProductFlavorDeclaration),
    keyword
  }
});

const input = fs.readFileSync(
  path.resolve(__dirname, "../__tests__/fixtures/build.gradle.kts"),
  "utf8"
);
lexer.reset(input);

const logState = (state: moo.LexerState, message: string = "") => {
  console.log(
    chalk.yellow(`#${state.line}: ${state.col} `),
    chalk.red(state.state),
    `: `,
    message
  );
};

const start = Date.now();

const initialState = lexer.save();
logState(initialState);

const buildTypes: string[] = [];
const productFlavors: string[] = [];

let token = lexer.next();
let previousState;
while (token) {
  const state = lexer.save();
  if (previousState !== state.state) {
    logState(state, token.value);
  }
  if (token.type === Type.string) {
    switch (state.state) {
      case State.BuildTypeDeclaration: {
        logState(state, chalk.green(token.value));
        buildTypes.push(token.value);
        break;
      }
      case State.ProductFlavorDeclaration: {
        logState(state, chalk.green(token.value));
        productFlavors.push(token.value);
        break;
      }
    }
  }
  previousState = state.state;
  token = lexer.next();
}

console.log(
  JSON.stringify(
    {
      buildTypes,
      productFlavors
    },
    null,
    2
  )
);

console.log(`completed in ${Date.now() - start} ms`);

inspectMemory();
