import * as fs from "fs";
import * as path from "path";

import { parse } from "./parser";

const input = fs.readFileSync(
  path.resolve(__dirname, "../__tests__/fixtures/build.gradle.kts"),
  "utf8"
);

console.log(parse(input));
