import { Tokenizer, tokenTypes, Token } from "./tokenizer";

export type AccessorExpression = (string | number)[];

export function parse(txt: string): AccessorExpression {
  const tokenizer = new Tokenizer(txt);
  return head(tokenizer);
}

export class ParseError extends Error {
  constructor(readonly code: keyof typeof errors, msg: string) {
    super(msg);
  }
}

const errors = {
  indexerNested: "Indexers cannot be nested.",
  indexerNeedquotes: "unquoted indexers must be numeric.",
  indexerEmpty: "cannot have empty indexers.",
  indexerLeadingdot: "Indexers cannot have leading dots.",
  indexerLeadingcomma: "Indexers cannot have leading comma.",
  indexerRequirescomma: "Indexers require commas between indexer args.",
  indexerRoutedtokens: "Only one token can be used per indexer when specifying routed tokens.",
  quoteEmpty: "cannot have empty quoted keys.",
  quoteIllegalescape: "Invalid escape character.  Only quotes are escapable.",
  unexpectedToken: "Unexpected token.",
  invalidIdentifier: "Invalid Identifier.",
  invalidPath: "Please provide a valid path.",
};

const throwError = (code: keyof typeof errors, tokenizer: Tokenizer, token?: any) => {
  if (token) {
    throw new ParseError(code, errors[code] + " -- " + tokenizer.parseString + " with next token: " + token);
  }
  throw new ParseError(code, errors[code] + " -- " + tokenizer.parseString);
};

function hasNext(token: any): token is { token: string, done: false, type: string } {
  return !token.done
} 

function head(tokenizer: Tokenizer) {
  let token = tokenizer.next();
  const state = { };
  const out = [];

  while (hasNext(token)) {
    switch (token.type) {
      case tokenTypes.token:
        const first = +token.token[0];
        if (!isNaN(first)) {
          throwError("invalidIdentifier", tokenizer);
        }
        out[out.length] = token.token;
        break;

      case tokenTypes.dotSeparator:
        // dotSeparators at the top level have no meaning
        if (out.length === 0) {
          throwError("unexpectedToken", tokenizer);
        }
        break;

      case tokenTypes.space:
        // Spaces do nothing.
        // NOTE: Spaces at the top level are allowed.
        // titlesById  .summary is a valid path.
        break;

      case tokenTypes.openingBracket:
        // Its time to decend the parse tree.
        indexer(tokenizer, token as any, state, out);
      break;

      default:
        throwError("unexpectedToken", tokenizer);
    }
    // Keep cycling through the tokenizer.
    token = tokenizer.next();
  }

  if (out.length === 0) {
    throwError("invalidPath", tokenizer);
  }

  return out;
};

function indexer(tokenizer: Tokenizer, openingToken: Token, state: any, out: (string | number)[]) {
  let token = tokenizer.next();
  let done = false;
  let allowedMaxLength = 1;
  // var routedIndexer = false;

  // State variables
  state.indexer = [];

  while (hasNext(token)) {

    switch (token.type) {
      case tokenTypes.token:
      case tokenTypes.quote:
        // ensures that token adders are properly delimited.
        if (state.indexer.length === allowedMaxLength) {
          throwError("indexerRequirescomma", tokenizer);
        }
        break;
    }

    switch (token.type) {
      case tokenTypes.token:
        var t = +token.token;
        if (isNaN(t)) {
          throwError("indexerNeedquotes", tokenizer);
        }
        state.indexer[state.indexer.length] = t;
        break;

      // Spaces do nothing.
      case tokenTypes.space:
        break;

      case tokenTypes.closingBracket:
        done = true;
      break;

      // The quotes require their own tree due to what can be in it.
      case tokenTypes.quote:
        quote(tokenizer, token, state, out);
      break;

      // Its time to decend the parse tree.
      case tokenTypes.openingBracket:
        throwError("indexerNested", tokenizer);

      case tokenTypes.commaSeparator:
        ++allowedMaxLength;
        break;

      default:
        throwError("unexpectedToken", tokenizer);
    }

    // If done, leave loop
    if (done) {
      break;
    }

    // Keep cycling through the tokenizer.
    token = tokenizer.next();
  }

  if (state.indexer.length === 0) {
    throwError("indexerEmpty", tokenizer);
  }

  // Remember, if an array of 1, keySets will be generated.
  if (state.indexer.length === 1) {
    state.indexer = state.indexer[0];
  }

  out[out.length] = state.indexer;

  // Clean state.
  state.indexer = undefined;
};


function quote(tokenizer: Tokenizer, openingToken: Token, state: any, out: (string | number)[]) {
  if (!hasNext(openingToken)) return;

  const { token: openingQuote } = openingToken;
  let token = tokenizer.next();
  let innerToken = "";
  let escaping = false;
  let done = false;

  while (hasNext(token)) {


    switch (token.type) {
      case tokenTypes.token:
      case tokenTypes.space:
      case tokenTypes.dotSeparator:
      case tokenTypes.commaSeparator:
      case tokenTypes.openingBracket:
      case tokenTypes.closingBracket:
      case tokenTypes.openingBrace:
      case tokenTypes.closingBrace:
        if (escaping) {
          throwError("quoteIllegalescape", tokenizer);
        }
        innerToken += token.token;
        break;
      case tokenTypes.quote:
        if (escaping) {
          // the simple case.  We are escaping
          innerToken += token.token;
          escaping = false;
        } else if (token.token !== openingQuote) {
          // its not a quote that is the opening quote
          innerToken += token.token;
        } else {
          // last thing left.  Its a quote that is the opening quote
          // therefore we must produce the inner token of the indexer.
          done = true;
        }

        break;
      case tokenTypes.escape:
        escaping = true;
        break;

      default:
        throwError("unexpectedToken", tokenizer);
    }

    // If done, leave loop
    if (done) {
      break;
    }

    // Keep cycling through the tokenizer.
    token = tokenizer.next();
  }

  if (innerToken.length === 0) {
    throwError("quoteEmpty", tokenizer);
  }

  state.indexer[state.indexer.length] = innerToken;
}
