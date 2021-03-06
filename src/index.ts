import * as fs from "fs";
import * as path from "path";

import { parse } from "./parser";

const paths: string[] = [
  "../__tests__/fixtures/build.gradle.kts",
  "../__tests__/fixtures/type-safe.gradle.kts",
  "../__tests__/fixtures/non-type-safe.gradle.kts",
  ...[
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23
  ].map(i => `../__tests__/fixtures/build-sample-${i}.gradle.kts`)
];

for (let file in paths) {
  console.log("=========================================");
  console.log("====== Parsing", paths[file], "========");
  console.log("=========================================");
  const input = fs.readFileSync(path.resolve(__dirname, paths[file]), "utf8");
  console.log(parse(input, true));
  console.log("");
  console.log("");
  console.log("");
}
