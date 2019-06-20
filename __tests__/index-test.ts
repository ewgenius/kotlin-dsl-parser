import path from "path";
import fs from "fs";
import { KotlinGradleDSLParser } from "../src/";

const testParsing = (input: string, expectedResult: any) => {
  const parser = new KotlinGradleDSLParser();
  const result = parser.parse(input);
  expect(result.length).toEqual(1);
  expect(result[0]).toEqual(expectedResult);
};

const tryParsing = (file: string) => {
  const input = fs.readFileSync(path.resolve(__dirname, file), "utf8");
  const parser = new KotlinGradleDSLParser();
  const result = parser.parse(input);
  expect(result.length).toEqual(1);
};

describe.each([
  [
    "empty block",
    `block{}`,
    { block: { type: "block", name: "block", body: [] } }
  ],
  [
    "empty block",
    `block {}`,
    { block: { type: "block", name: "block", body: [] } }
  ],
  [
    "empty block",
    `block { }`,
    { block: { type: "block", name: "block", body: [] } }
  ],
  [
    "apply call",
    `apply(plugin = "java-library")`,
    {
      apply: {
        name: "apply",
        type: "function",
        arguments: [
          {
            declaration: "plugin",
            value: "java-library"
          }
        ]
      }
    }
  ],
  [
    "two empty blocks inline",
    `block1 { } block2 { }`,
    {
      block1: { type: "block", name: "block1", body: [] },
      block2: { type: "block", name: "block2", body: [] }
    }
  ],
  [
    "two empty blocks multiline",
    `
      block1 { }
      block2 { }
      `,
    {
      block1: { type: "block", name: "block1", body: [] },
      block2: { type: "block", name: "block2", body: [] }
    }
  ],
  [
    "chanined name block",
    `test.block { }`,
    { "test.block": { type: "block", name: "test.block", body: [] } }
  ],
  [
    "block with field",
    `block {test}`,
    { block: { type: "block", name: "block", body: ["test"] } }
  ],
  [
    "block with field",
    `block { test }`,
    { block: { type: "block", name: "block", body: ["test"] } }
  ],
  [
    "block with inline fields",
    `block { test one two }`,
    { block: { type: "block", name: "block", body: ["test", "one", "two"] } }
  ],
  [
    "block with multyline fields",
    `block {
        test
        one
        two
      }`,
    { block: { type: "block", name: "block", body: ["test", "one", "two"] } }
  ],
  [
    "block with chained field",
    `block { test.one.two }`,
    { block: { type: "block", name: "block", body: ["test.one.two"] } }
  ],
  [
    "block with expression a = b",
    `block { a = b }`,
    {
      block: {
        type: "block",
        name: "block",
        body: [{ declaration: "a", value: "b" }]
      }
    }
  ],
  [
    'block with inline expression a = "b"',
    `block { a = "b" }`,
    {
      block: {
        type: "block",
        name: "block",
        body: [{ declaration: "a", value: "b" }]
      }
    }
  ],
  [
    "block with inline expression a = 1",
    `block { a = 1 }`,
    {
      block: {
        type: "block",
        name: "block",
        body: [{ declaration: "a", value: 1 }]
      }
    }
  ],
  [
    "block with function call and argument",
    `block { a = function.call("test") }`,
    {
      block: {
        type: "block",
        name: "block",
        body: [
          {
            declaration: "a",
            value: {
              type: "function",
              name: "function.call",
              arguments: ["test"]
            }
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
        type: "block",
        name: "block",
        body: [{ type: "function", name: "function", arguments: [] }]
      }
    }
  ],
  [
    "block with chained function call",
    `block { function.call() }`,
    {
      block: {
        type: "block",
        name: "block",
        body: [{ type: "function", name: "function.call", arguments: [] }]
      }
    }
  ],
  [
    "block with function call multiple arguments",
    `block { function.call(1,2,"Test") }`,
    {
      block: {
        type: "block",
        name: "block",
        body: [
          { type: "function", name: "function.call", arguments: [1, 2, "Test"] }
        ]
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
        type: "block",
        name: "block",
        body: [
          { type: "function", name: "function.call", arguments: [1, 2, "Test"] }
        ]
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
        type: "block",
        name: "block",
        body: [
          "test",
          { type: "function", name: "function.call", arguments: [] }
        ]
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
        type: "block",
        name: "block",
        body: [
          "test",
          { type: "function", name: "function.call", arguments: [] },
          {
            type: "block",
            name: "sub_block",
            body: ["test", { type: "function", name: "call2", arguments: [] }]
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
        type: "block",
        name: "plugins",
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
        type: "block",
        name: "plugins",
        body: [
          {
            type: "function",
            name: "id",
            arguments: ["com.android.application"]
          }
        ]
      },
      block: {
        type: "block",
        name: "block",
        body: [
          "test",
          { type: "function", name: "function.call", arguments: [] },
          {
            type: "block",
            name: "sub_block",
            body: ["test", { type: "function", name: "call2", arguments: [] }]
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
        type: "block",
        name: "plugins",
        body: [
          {
            type: "function",
            name: "id",
            arguments: ["com.android.application"]
          }
        ]
      },
      block: {
        type: "block",
        name: "block",
        body: [
          "test",
          { type: "function", name: "function.call", arguments: [] },
          {
            type: "block",
            name: "sub_block",
            body: ["test", { type: "function", name: "call2", arguments: [] }]
          }
        ]
      }
    }
  ],
  [
    "multline comment",
    `
      /* test */
      block {}
    `,
    {
      block: {
        name: "block",
        type: "block",
        body: []
      }
    }
  ]
])("Grammar tests", ((name: string, input: string, expected: any) => {
  it(`should parse: ${name}`, () => testParsing(input, expected));
}) as any);

describe("Real examples test", () => {
  const filesList = [
    "./fixtures/type-safe.gradle.kts",
    "./fixtures/non-type-safe.gradle.kts"
  ];

  describe.each(filesList.map(file => [file]))(
    "Real examples test",
    (file: string) => {
      it(`should parse "${file}"`, () => tryParsing(file));
    }
  );
});

describe("Test", () => {
  it.only("", () => {
    const parser = new KotlinGradleDSLParser();
    const result = parser.parse(`
    plugins {
      id("com.android.application")
    }
  `);
    expect(result[0]).toEqual([]);
  });
});
