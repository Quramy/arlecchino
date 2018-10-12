import { getValue, assignValue } from ".";

describe("getValue", () => {
  it("should access value", () => {
    expect(getValue(["a"], { a: 1 })).toBe(1);
  });

  it("should access value with complex expression", () => {
    expect(getValue(["a", 0, "b"], { a: [{ b: 1 }] })).toBe(1);
  });

  it("should return null when unreachable expression", () => {
    expect(getValue(["a"], null)).toBeNull();
  });

  it("should throw an error when disabled optional access", () => {
    expect(() => getValue(["a"], null, false)).toThrow();
  });
});

describe("assignValue", () => {
  it("should set value", () => {
    expect(assignValue(["a"], { a: 1 }, 2)).toEqual({ a: 2 });
  });

  it("should set value when expression is unreachable", () => {
    expect(assignValue(["a"], { }, 2)).toEqual({ a: 2 });
  });

  it("should set value when expression is deeply unreachable", () => {
    expect(assignValue(["a", "b"], { }, 2)).toEqual({ a: { b: 2 } });
  });
});
