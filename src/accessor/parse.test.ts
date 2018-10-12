import { parse } from "./parse";

describe("parse", () => {
  it("should parse a", () => expect(parse("a")).toEqual(["a"]));

  it("should parse a.a", () => expect(parse("a.a")).toEqual(["a", "a"]));

  it("should parse ' a.a'", () => expect(parse(" a.a")).toEqual(["a", "a"]));

  it("should parse a[0]", () => expect(parse("a[0]")).toEqual(["a", 0]));

  it("should parse a['a']", () => expect(parse("a['a']")).toEqual(["a", "a"]));
});
