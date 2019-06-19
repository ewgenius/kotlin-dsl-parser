import { Parser, Grammar } from "nearley";
import * as grammar from "./grammars/kotlin";

export class KotlinDSLParser {
  private parser = new Parser(Grammar.fromCompiled(grammar));

  public parse(contents: string): any[] {
    this.parser.feed(contents);
    this.parser.finish();
    return this.parser.results && this.parser.results;
  }
}
