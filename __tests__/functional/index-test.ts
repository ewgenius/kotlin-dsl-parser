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
  describe.each([
    [`block{}`, { block: { block: "block", body: [] } }],
    [`block {}`, { block: { block: "block", body: [] } }],
    [`block { }`, { block: { block: "block", body: [] } }],
    [`test.block { }`, { "test.block": { block: "test.block", body: [] } }],
    [`"block" { }`, { '"block"': { block: '"block"', body: [] } }],
    [`block {test}`, { block: { block: "block", body: ["test"] } }],
    [`block { test }`, { block: { block: "block", body: ["test"] } }],
    [
      `block { test one two }`,
      { block: { block: "block", body: ["test", "one", "two"] } }
    ],
    [
      `block { function() }`,
      {
        block: {
          block: "block",
          body: [{ function: "function", arguments: [] }]
        }
      }
    ],
    [
      `block { function.call() }`,
      {
        block: {
          block: "block",
          body: [{ function: "function.call", arguments: [] }]
        }
      }
    ],
    [
      `
      block {
        test
        function.call()
      }
      `,
      {
        block: {
          block: "block",
          body: ["test", { function: "function.call", arguments: [] }]
        }
      }
    ],
    [
      `
      block {
        test
        function.call()
        sub_block {
          test
          call2()
        }
      }
      `,
      {
        block: {
          block: "block",
          body: [
            "test",
            { function: "function.call", arguments: [] },
            {
              block: "sub_block",
              body: ["test", { function: "call2", arguments: [] }]
            }
          ]
        }
      }
    ]
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
