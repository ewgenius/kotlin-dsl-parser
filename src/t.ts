import { KotlinDSLParser } from "./index";

function inspectMemory(log: string) {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(log);
  console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
}

const input = `
plugins {
  "java-library"
}

`;

console.log("Input file", input);

inspectMemory("Start script");

const parser = new KotlinDSLParser();

inspectMemory("Parser initialized");

const results = parser.parse(input);

inspectMemory("Parsing finished");

console.log("Parsed result", results);

