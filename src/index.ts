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

// const parser = new KotlinDSLParser();

// console.log(parser.parse(`
// plugins {
//   "java-library"
// }

// dependencies {
//   api("junit:junit:4.12")
//   implementation("junit:junit:4.12")
//   testImplementation("junit:junit:4.12")
// }

// configurations {

//   implementation {
//     resolutionStrategy.failOnVersionConflict()
//   }

//   "production" {
//     resolutionStrategy.failOnVersionConflict()
//   }

// }

// buildFalovrs {
//   development {
//     restrict()
//   }

//   production {
//     restrict()
//   }
// }
// `));
