import { KotlinDSLParser } from "./index";

function inspectMemory(log: string) {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(log);
  console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
}

let start = Date.now();

function inspectTime() {
  const now = Date.now();
  const elapsed = now - start;
  start = now;
  console.log(`Elapsed: ${elapsed} ms`);
}

const input = `
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
}

sourceSets {
  main {                  
    java.srcDir("src/core/java")
  }
}

java {
  sourceCompatibility = JavaVersion.VERSION_11
  targetCompatibility = JavaVersion.VERSION_11
}

tasks {
  test {                  
    testLogging.showExceptions = true
  }
}
`;

console.log("Input file", input);

inspectMemory("Start script");
inspectTime();

const parser = new KotlinDSLParser();

inspectMemory("Parser initialized");
inspectTime();

const results = parser.parse(input);

inspectMemory("Parsing finished");
inspectTime();

console.log("Parsed result", results);

