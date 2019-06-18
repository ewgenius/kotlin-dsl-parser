import { Parser, Grammar } from "nearley";
import * as grammar from "./grammars/kotlin";

export class KotlinDSLParser {
  private parser = new Parser(Grammar.fromCompiled(grammar));

  public parse(contents: string): any[] {
    this.parser.feed(contents);
    this.parser.finish();
    console.log(this.parser.results.length);

    console.log(JSON.stringify(this.parser.results, null, 2));

    return this.parser.results && this.parser.results[0];
  }
}
