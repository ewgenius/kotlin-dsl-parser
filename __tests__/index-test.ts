import path from "path";
import fs from "fs";
import { KotlinDSLParser } from "../src/";

const testParsing = (input: string, expectedResult: any) => {
  const parser = new KotlinDSLParser();
  const result = parser.parse(input);
  expect(result.length).toEqual(1);
  expect(result[0]).toEqual(expectedResult);
};

const tryParsing = (file: string) => {
  const input = fs.readFileSync(path.resolve(__dirname, file), "utf8");
  const parser = new KotlinDSLParser();
  const result = parser.parse(input);
  expect(result.length).toEqual(1);
};

describe.each([
  ["empty block", `block{}`, { block: { block: "block", body: [] } }],
  ["empty block", `block {}`, { block: { block: "block", body: [] } }],
  ["empty block", `block { }`, { block: { block: "block", body: [] } }],
  [
    "two empty blocks inline",
    `block1 { } block2 { }`,
    {
      block1: { block: "block1", body: [] },
      block2: { block: "block2", body: [] }
    }
  ],
  [
    "two empty blocks multiline",
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
    "chanined name block",
    `test.block { }`,
    { "test.block": { block: "test.block", body: [] } }
  ],
  [
    "block with field",
    `block {test}`,
    { block: { block: "block", body: ["test"] } }
  ],
  [
    "block with field",
    `block { test }`,
    { block: { block: "block", body: ["test"] } }
  ],
  [
    "block with inline fields",
    `block { test one two }`,
    { block: { block: "block", body: ["test", "one", "two"] } }
  ],
  [
    "block with multyline fields",
    `block {
        test
        one
        two
      }`,
    { block: { block: "block", body: ["test", "one", "two"] } }
  ],
  [
    "block with chained field",
    `block { test.one.two }`,
    { block: { block: "block", body: ["test.one.two"] } }
  ],
  [
    "block with expression a = b",
    `block { a = b }`,
    {
      block: {
        block: "block",
        body: [{ declaration: "a", value: "b" }]
      }
    }
  ],
  [
    'block with inline expression a = "b"',
    `block { a = "b" }`,
    {
      block: {
        block: "block",
        body: [{ declaration: "a", value: "b" }]
      }
    }
  ],
  [
    "block with inline expression a = 1",
    `block { a = 1 }`,
    {
      block: {
        block: "block",
        body: [{ declaration: "a", value: 1 }]
      }
    }
  ],
  [
    "block with function call and argument",
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
    "block with empty function call",
    `block { function() }`,
    {
      block: {
        block: "block",
        body: [{ function: "function", arguments: [] }]
      }
    }
  ],
  [
    "block with chained function call",
    `block { function.call() }`,
    {
      block: {
        block: "block",
        body: [{ function: "function.call", arguments: [] }]
      }
    }
  ],
  [
    "block with function call multiple arguments",
    `block { function.call(1,2,"Test") }`,
    {
      block: {
        block: "block",
        body: [{ function: "function.call", arguments: [1, 2, "Test"] }]
      }
    }
  ],
  [
    "block with function call multiline arguments",
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
    "block different fields",
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
    "block with sub-block",
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
    "quotes",
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
    "complex example",
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
    "complex example with comments",
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
  ]
])("Grammar tests", ((name: string, input: string, expected: any) => {
  it(`should parse: ${name}`, () => testParsing(input, expected));
}) as any);

describe("Real examples test", () => {
  const filesList = ["./fixtures/type-safe.gradle.kts"];

  describe.each(filesList.map(file => [file]))(
    "Real examples test",
    (file: string) => {
      it(`should parse "${file}"`, () => tryParsing(file));
    }
  );
});
