import test from "node:test";
import { assertMatches } from "../../test-utils.js";
import { defineFilename } from "./define-filename.js";
import { testPrompt } from "../../test/test-prompt.js";

const prompt = await testPrompt();

test("Defines a good name for a file with a function", async () => {
  const result = await defineFilename(prompt, "const a = b => b + 1;");
  // Accept variations of increment-related names
  // LLM output varies: "increment.js", "addOne.js", "incrementor.js", "incrementFile.js", etc.
  assertMatches(result, ["increment", "addone", "inc"]);
});
