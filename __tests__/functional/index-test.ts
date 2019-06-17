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
  describe("plugins", () => {
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

  describe("block sections", () => {
    it(`should parse block sections`, () => {
      testParsing(
        `
          section1 { }
          section2 { }
          "section3" { }
        `,
        {
          section1: {
            name: "section1",
            body: undefined
          },
          section2: {
            name: "section2",
            body: undefined
          },
          section3: {
            name: "section3",
            body: undefined
          }
        }
      );
    });

    it(`should parse sub sections`, () => {
      testParsing(
        `
          section1 {
            section2 { }
          }
        `,
        {
          section1: {
            name: "section1",
            body: [
              {
                name: "section2",
                body: undefined
              }
            ]
          }
        }
      );
    });
  });

  // describe.each([
  //   ["../fixtures/type-safe.gradle.kts"]
  // ])("", (p) => {
  //   const file = fs.readFileSync(path.resolve(__dirname, p), "utf8");
  //   const parser = new KotlinDSLParser();
  //   parser.parse(file);
  // });
});
