import path from "path"
import fs from "fs";
import { KotlinDSLParser } from "../../src/";

describe("Parser functional tests", () => {
  describe.each([
    ["../fixtures/type-safe.gradle.kts"]
  ])("", (p) => {
    console.log(path.resolve(p));
    const file = fs.readFileSync(path.resolve(__dirname, p), "utf8");
    const parser = new KotlinDSLParser();
    parser.parse(file);
  });
});
