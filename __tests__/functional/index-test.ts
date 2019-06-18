import path from "path";
import fs from "fs";
import { KotlinDSLParser } from "../../src/";

const testParsing = (input: string, expectedResult: any) => {
  const parser = new KotlinDSLParser();
  const result = parser.parse(input);

  // expect(result.length).toEqual(1);
  expect(result).toEqual(expectedResult);
};

describe("Parser functional tests", () => {
  describe.skip("plugins", () => {
    it(`should parse "plugins { ... }"`, () => {
      testParsing(
        `
          plugins {
            id("test.plugin")
          }

          section1 { }
        `,
        []
      );
    });
  });

  describe.skip("block sections", () => {
    it(`should parse block section`, () => {
      testParsing(`section { }`, {
        section: {
          name: "section",
          body: []
        }
      });
    });

    it(`should parse block section with multiple fields`, () => {
      testParsing(`section {field1 field2}`, {
        section: {
          name: "section",
          body: ["field1", "field2"]
        }
      });
    });

    it(`should parse sub sections`, () => {
      testParsing(`section1 { section2 { } }`, {
        section1: {
          name: "section1",
          body: [
            {
              name: "section2",
              body: []
            }
          ]
        }
      });
    });

    it(`should parse empty call`, () => {
      testParsing(`section { test() }`, {
        section: {
          name: "section",
          body: [
            {
              call: "test",
              arguments: []
            }
          ]
        }
      });
    });

    it(`should parse call with arguments`, () => {
      testParsing(`section1 { test(1, "test") }`, {
        section1: {
          name: "section1",
          body: [
            [
              {
                call: "test",
                arguments: [1, "test"]
              }
            ]
          ]
        }
      });
    });

    it(`should parse chained item`, () => {
      testParsing(`section { com.test }`, {
        section: {
          name: "section",
          body: ["com.test"]
        }
      });
    });
  });

  describe.each([
    [`section { }`, { section: { block: "section", body: [] } }],
    [
      `test.section { }`,
      { "test.section": { block: "test.section", body: [] } }
    ],
    [`"section" { }`, { '"section"': { block: '"section"', body: [] } }],
    [`section { test }`, { section: { block: "section", body: [ "test" ] } }],
    [`section { test one two }`, { section: { block: "section", body: [ "test", "one", "two" ] } }],
    [`section { function() }`, { section: { block: "section", body: [ { function: "function", arguments: [] } ] } }],
    [`section { function.call() }`, { section: { block: "section", body: [ { function: "function.call", arguments: [] } ] } }],
  ])("test", ((input: string, expected: any) => {
    it(`should parse: ${input}`, () => testParsing(input, expected));
  }) as any);

  // describe.each([
  //   ["../fixtures/type-safe.gradle.kts"]
  // ])("", (p) => {
  //   const file = fs.readFileSync(path.resolve(__dirname, p), "utf8");
  //   const parser = new KotlinDSLParser();
  //   parser.parse(file);
  // });
});
