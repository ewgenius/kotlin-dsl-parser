import { Parser, Grammar } from "nearley";
import * as grammar from "./grammars/kotlin";

const parser = new Parser(Grammar.fromCompiled(grammar));

parser.feed(`test { aa.bb() // comment }`);

console.log(parser.results);
