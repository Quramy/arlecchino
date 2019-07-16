import assert from "assert";
import {
  toLineAndCharcter,
} from "./trace-functions";

describe("toLineAndCharcter", () => {
  it("should return line and character when no line, no character", () => {
    const input = "a";
    const actual = toLineAndCharcter(input, 0);
    assert.deepEqual(actual, { line: 0, character: 0 });
  });

  it("should return line and character when no line, character", () => {
    const input = "a";
    const actual = toLineAndCharcter(input, 1);
    assert.deepEqual(actual, { line: 0, character: 1 });
  });

  it("should return line and character when LF", () => {
    const input = "a\nabcdef";
    const actual = toLineAndCharcter(input, 3);
    assert.deepEqual(actual, { line: 1, character: 1 });
  });

  it("should return line and character when CRLF", () => {
    const input = "a\r\nabcdef";
    const actual = toLineAndCharcter(input, 4);
    assert.deepEqual(actual, { line: 1, character: 1 });
  });

  it("should return line and character when multiple LFs", () => {
    const input = "a\r\nabc\ndef\n\nabc";
    const actual = toLineAndCharcter(input, 13);
    assert.deepEqual(actual, { line: 4, character: 1 });
  });
});
