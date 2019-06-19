import path from "path";
import fs from "fs";
import { KotlinDSLParser } from "../src/";

const testParsing = (input: string, expectedResult: any) => {
  const parser = new KotlinDSLParser();
  const result = parser.parse(input);
  expect(result.length).toEqual(1);
  expect(result[0]).toEqual(expectedResult);
};

describe("Grammar tests", () => {
  describe.each([
    [`block{}`, { block: { block: "block", body: [] } }],
    [`block {}`, { block: { block: "block", body: [] } }],
    [`block { }`, { block: { block: "block", body: [] } }],
    [
      `
      block1 { }
      block2 { }
      `,
      {
        block1: { block: "block1", body: [] },
        block2: { block: "block2", body: [] }
      }
    ],
    [
      `
      block1 { }
      block2 { }
      `,
      {
        block1: { block: "block1", body: [] },
        block2: { block: "block2", body: [] }
      }
    ],
    [`test.block { }`, { "test.block": { block: "test.block", body: [] } }],
    [`block { }`, { block: { block: "block", body: [] } }],
    [`block {test}`, { block: { block: "block", body: ["test"] } }],
    [`block { test }`, { block: { block: "block", body: ["test"] } }],
    [
      `block {
        test
        one
        two
      }`,
      { block: { block: "block", body: ["test", "one", "two"] } }
    ],
    [
      `block { test.one.two }`,
      { block: { block: "block", body: ["test.one.two"] } }
    ],
    [
      `block { a = b }`,
      {
        block: {
          block: "block",
          body: [{ declaration: "a", value: "b" }]
        }
      }
    ],
    [
      `block { a = "b" }`,
      {
        block: {
          block: "block",
          body: [{ declaration: "a", value: "b" }]
        }
      }
    ],
    [
      `block { a = 1 }`,
      {
        block: {
          block: "block",
          body: [{ declaration: "a", value: 1 }]
        }
      }
    ],
    [
      `block { a = function.call("test") }`,
      {
        block: {
          block: "block",
          body: [
            {
              declaration: "a",
              value: { function: "function.call", arguments: ["test"] }
            }
          ]
        }
      }
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
      `block { function.call(1,2,"Test") }`,
      {
        block: {
          block: "block",
          body: [{ function: "function.call", arguments: [1, 2, "Test"] }]
        }
      }
    ],
    [
      `block { function.call(
        1,
        2  ,  "Test"
      ) }`,
      {
        block: {
          block: "block",
          body: [{ function: "function.call", arguments: [1, 2, "Test"] }]
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
      block { function.call("test") }
      `,
      {
        block: {
          block: "block",
          body: [{ function: "function.call", arguments: ["test"] }]
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
    ],
    [
      `
      plugins {
        \`java-library\`
      }
      `,
      {
        plugins: {
          block: "plugins",
          body: ["java-library"]
        }
      }
    ],
    [
      `
      plugins {
        id("com.android.application")
      }
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
        plugins: {
          block: "plugins",
          body: [
            {
              function: "id",
              arguments: ["com.android.application"]
            }
          ]
        },
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
    ],
    [
      `
    // comment
    plugins {
      id("com.android.application") // comment
    }
    block {
      test // comment 123 test.
      function.call()
      sub_block {
        test
        call2() // test
      }
    }
    `,
      {
        plugins: {
          block: "plugins",
          body: [
            {
              function: "id",
              arguments: ["com.android.application"],
            }
          ]
        },
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
});
