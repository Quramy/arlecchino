import { AccessorExpression } from "./parse";
export { parse, AccessorExpression, ParseError as AccessorParseError } from "./parse";

export function getValue(expression: AccessorExpression, scope: any, optional = true): any {
  if (!expression || !expression.length) return;
  return expression.reduce((acc: any, path) => {
    if (optional && (!acc || !acc[path])) {
      return null;
    }
    return acc[path];
  }, scope);
}

export function assignValue(expression: AccessorExpression, scope: any, value: any, optional = true): any {
  if (!expression || !expression.length) return scope;
  if (optional && !scope) {
    if (typeof expression[0] ==="number") {
      scope = [];
    } else {
      scope = { };
    }
  }
  let target = scope;
  expression.slice(0, expression.length - 1).forEach(path => {
    if (optional && !target[path]) {
      target[path] = typeof path === "number" ? [] : { };
    }
    target = target[path];
  });
  target[expression[expression.length - 1]] = value;
  return scope;
}
