
const DOT_SEPARATOR = ".";
const COMMA_SEPARATOR = ",";
const OPENING_BRACKET = "[";
const CLOSING_BRACKET = "]";
const OPENING_BRACE = "{";
const CLOSING_BRACE = "}";
const COLON = ":";
const ESCAPE = "\\";
const DOUBLE_OUOTES = '"';
const SINGE_OUOTES = "'";
const TAB = "\t";
const SPACE = " ";
const LINE_FEED = "\n";
const CARRIAGE_RETURN = "\r";
const SPECIAL_CHARACTERS = '\\\'"[]., \t\n\r';

export const tokenTypes = {
  token: "token",
  dotSeparator: ".",
  commaSeparator: ",",
  openingBracket: "[",
  closingBracket: "]",
  openingBrace: "{",
  closingBrace: "}",
  escape: "\\",
  space: " ",
  colon: ":",
  quote: "quote",
  unknown: "unknown",
};

export type Token = { token: string, done: boolean, type: string } | { done: boolean };
export type Tokens = keyof typeof tokenTypes;
export type TokenValues = (typeof tokenTypes)[keyof typeof tokenTypes];

export class Tokenizer {

  private _idx: number = -1;
  parseString = "";

  constructor(private txt: string) {
  }

  next(): Token {
    const nextToken = this.getNext(this.txt, this._idx);
    this._idx = nextToken.idx;
    if (nextToken.token && nextToken.token.token) {
      this.parseString += nextToken.token.token;
    }
    return nextToken.token;
  }

  private getNext(txt: string, idx: number) {
    let output = undefined;
    let token = "";
    const specialChars = SPECIAL_CHARACTERS;
    let done = false;

    const toOutput = (token: string, type: TokenValues, done: boolean) => ({ token, done, type });

    do {

      done = idx + 1 >= txt.length;
      if (done) {
        break;
      }

      let character = txt[idx + 1];

      if (character !== undefined && specialChars.indexOf(character) === -1) {

        token += character;
        ++idx;
        continue;
      }

      else if (token.length) {
        break;
      }

      ++idx;
      let type: TokenValues;
      switch (character) {
        case DOT_SEPARATOR:
          type = tokenTypes.dotSeparator;
          break;
        case COMMA_SEPARATOR:
          type = tokenTypes.commaSeparator;
          break;
        case OPENING_BRACKET:
          type = tokenTypes.openingBracket;
          break;
        case CLOSING_BRACKET:
          type = tokenTypes.closingBracket;
          break;
        case OPENING_BRACE:
          type = tokenTypes.openingBrace;
          break;
        case CLOSING_BRACE:
          type = tokenTypes.closingBrace;
          break;
        case TAB:
          case SPACE:
          case LINE_FEED:
          case CARRIAGE_RETURN:
          type = tokenTypes.space;
          break;
        case DOUBLE_OUOTES:
          case SINGE_OUOTES:
          type = tokenTypes.quote;
          break;
        case ESCAPE:
          type = tokenTypes.escape;
          break;
        case COLON:
          type = tokenTypes.colon;
          break;
        default:
          type = tokenTypes.unknown;
          break;
      }
      output = toOutput(character, type, false);
      break;
    } while (!done);

    if (!output && token.length) {
      output = toOutput(token, tokenTypes.token, false);
    }

    if (!output) {
      return {
        token: { token: null, done: true, type: null },
        idx,
      };
    }

    return {
      token: output,
      idx: idx
    };
  }
}
