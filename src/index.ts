import { Parser, Grammar } from "nearley";
import * as grammar from "./grammars/kotlin";

const start = process.memoryUsage();

const parser = new Parser(Grammar.fromCompiled(grammar));

parser.feed(`
plugins {
  "java-library"
}

dependencies {
  api("junit:junit:4.12")
  implementation("junit:junit:4.12")
  testImplementation("junit:junit:4.12")
}

configurations {

  implementation {
    resolutionStrategy.failOnVersionConflict()
  }

  "production" {
    resolutionStrategy.failOnVersionConflict()
  }

}

buildFalovrs {
  development {
    restrict()
  }

  production {
    restrict()
  }
}
`);


console.log(parser.results.push.length);
console.log(JSON.stringify(parser.results[0], null, 2));

const end = process.memoryUsage();

console.log(`Used: ${end.heapUsed - start.heapUsed}`);
