import * as moo from "moo";
import chalk from "chalk";
import { Rule } from "moo";

function inspectMemory() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The script uses approximately ${Math.round(used * 100) / 100} MB`
  );
}

export enum Type {
  WS = "WS",
  comment = "comment",
  multilinecomment = "multilinecomment",
  number = "number",
  string = "string",
  NL = "NL",
  identifier = "identifier",

  PluginId = "pluginId",
  AndroidPlugin = "com.android.application"
}

export type RulesDictionary = {
  [key: string]: Rule;
};

export enum State {
  Root = "root",
  Plugins = "plugins",
  Android = "android",
  BuildTypes = "buildTypes",
  BuildTypeDeclaration = "buildTypeDeclaration",
  ProductFlavors = "productFlavors",
  ProductFlavorDeclaration = "ProductFlavorDeclaration"
}

const keyword = [
  "(",
  ")",
  "{",
  "}",
  "=",
  ",",
  "[",
  "]",
  "!",
  ".",
  ":",
  "->",
  "?",
  "&",
  "|"
];

const ignoringRules: RulesDictionary = {
  [Type.WS]: { match: /[ \t]+/ },
  [Type.comment]: { match: /\/\/.*?$/ },
  [Type.multilinecomment]: { match: /\/\*[\s\S]*?\*\//, lineBreaks: true }
};

const baseRules: RulesDictionary = {
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
  android: { match: /android *{/, push: State.Android }
};

const androidRules: RulesDictionary = {
  buildTypes: { match: /buildTypes *{/, push: State.BuildTypes },
  productFlavors: { match: /productFlavors[ *]{/, push: State.ProductFlavors }
};

const pluginRules: RulesDictionary = {
  [Type.AndroidPlugin]: { match: "com.android.application" }
};

function blockRules(push: State): RulesDictionary {
  return {
    "{": { match: "{", push },
    "}": { match: "}", pop: 1 }
  };
}

function parentesisRules(push: State): RulesDictionary {
  return {
    "(": { match: "(", push },
    ")": { match: ")", pop: 1 }
  };
}

function buildTypesDeclarationRules(push: State): RulesDictionary {
  return {
    getByName: { match: /getByName *\(/, push },
    create: { match: /create *\(/, push }
  };
}

function productFlavorsDeclarationRules(push: State): RulesDictionary {
  return {
    create: { match: /create *\(/, push }
  };
}

function extendRules(rules: RulesDictionary, next: State) {
  return Object.keys(rules).reduce((extended: RulesDictionary, key: string) => {
    extended[key] = {
      ...rules[key],
      next
    };
    return extended;
  }, {});
}

const lexer = moo.states({
  [State.Root]: {
    ...extendRules(ignoringRules, State.Root),
    ...mainRules,
    ...extendRules(baseRules, State.Root),
    keyword
  },
  [State.Plugins]: {
    ...extendRules(ignoringRules, State.Plugins),
    ...blockRules(State.Plugins),
    ...extendRules(pluginRules, State.Plugins),
    ...extendRules(baseRules, State.Plugins),
    keyword
  },
  [State.Android]: {
    ...extendRules(ignoringRules, State.Android),
    ...blockRules(State.Android),
    ...androidRules,
    ...extendRules(baseRules, State.Android),
    keyword
  },
  [State.BuildTypes]: {
    ...extendRules(ignoringRules, State.BuildTypes),
    ...buildTypesDeclarationRules(State.BuildTypeDeclaration),
    ...blockRules(State.BuildTypes),
    ...extendRules(baseRules, State.BuildTypes),
    keyword
  },
  [State.BuildTypeDeclaration]: {
    ...extendRules(ignoringRules, State.BuildTypeDeclaration),
    ...blockRules(State.BuildTypeDeclaration),
    ...parentesisRules(State.BuildTypeDeclaration),
    ...extendRules(baseRules, State.BuildTypeDeclaration),
    keyword
  },
  [State.ProductFlavors]: {
    ...extendRules(ignoringRules, State.ProductFlavors),
    ...productFlavorsDeclarationRules(State.ProductFlavorDeclaration),
    ...blockRules(State.ProductFlavors),
    ...extendRules(baseRules, State.ProductFlavors),
    keyword
  },
  [State.ProductFlavorDeclaration]: {
    ...extendRules(ignoringRules, State.ProductFlavorDeclaration),
    ...parentesisRules(State.ProductFlavorDeclaration),
    ...blockRules(State.ProductFlavorDeclaration),
    ...extendRules(baseRules, State.ProductFlavorDeclaration),
    keyword
  }
});

function getStateLevel(state: moo.LexerState): number {
  switch (state.state) {
    case State.Plugins:
    case State.Android: {
      return 1;
      break;
    }
    case State.BuildTypes:
    case State.ProductFlavors: {
      return 2;
      break;
    }
    case State.BuildTypeDeclaration:
    case State.ProductFlavorDeclaration: {
      return 3;
      break;
    }
  }
  return 0;
}

function logState(state: moo.LexerState, message: string = "") {
  let statePrefix = "";
  switch (state.state) {
    case State.Plugins:
    case State.Android: {
      statePrefix = "--";
      break;
    }
    case State.BuildTypes:
    case State.ProductFlavors: {
      statePrefix = "----";
      break;
    }
    case State.BuildTypeDeclaration:
    case State.ProductFlavorDeclaration: {
      statePrefix = "------";
      break;
    }
  }
  console.log(
    chalk.red(`${statePrefix}${state.state}`),
    chalk.yellow(`#${state.line}:${state.col} `),
    message
  );
}

export function parse(input: string, debug = false) {
  const start = Date.now();
  lexer.reset(input);

  const initialState = lexer.save();
  if (debug) {
    logState(initialState);
  }

  const buildTypes = new Set<string>(["release", "debug"]);
  const productFlavors = new Set<string>();

  let token = lexer.next();
  let previousState;
  while (token) {
    const state = lexer.save();
    if (
      debug &&
      (!previousState ||
        (previousState.state !== state.state &&
          getStateLevel(state) >= getStateLevel(previousState)))
    ) {
      logState(state, token.value);
    }
    if (token.type === Type.string) {
      switch (state.state) {
        case State.BuildTypeDeclaration: {
          if (debug) {
            logState(state, chalk.green(token.value));
          }
          buildTypes.add(token.value);
          break;
        }
        case State.ProductFlavorDeclaration: {
          if (debug) {
            logState(state, chalk.green(token.value));
          }
          productFlavors.add(token.value);
          break;
        }
      }
    }
    previousState = state;
    token = lexer.next();
  }

  const result = {
    buildTypes: Array.from(buildTypes),
    productFlavors: Array.from(productFlavors)
  };

  if (debug) {
    console.log(JSON.stringify(result, null, 2));
    console.log(`completed in ${Date.now() - start} ms`);
    inspectMemory();
  }

  return result;
}
