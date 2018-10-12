import { Context } from "mustache";

export class ValueStore {
  private ctx = new Context({ });

  setValue(name: string, value: any) {
    // hoge.foo.bar -> [hoge, foo, bar]
    const tmp = name.split(".");
    const lookupKey = tmp.slice(0, tmp.length - 1).join("."); // -> hoge.foo
    const newName = tmp[tmp.length - 1]; // -> bar
    // console.log(lookupKey, newName, value);
    if (!lookupKey) {
      this.ctx.view[newName] = value;
    } else {
      const v = this.ctx.lookup(lookupKey);
      if (!v) {
        this.setValue(lookupKey, { });
        // console.log(this.ctx.view);
      }
      // console.log(lookupKey, this.ctx.lookup(lookupKey), this.ctx.view);
      this.ctx.lookup(lookupKey)[newName] = value;
    }
  }

  getValue(name: string): any {
    return this.ctx.lookup(name);
  }
}
