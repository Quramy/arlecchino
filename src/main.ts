import { compile } from "./compile";
import { Context, run } from "./runner";

export type MainOption = {
  suiteFile: string,
  showBrowser?: boolean,
};

export async function main(opt: MainOption) {
  const { suiteFile } = opt;
  const { rootModel, metadata } = compile(suiteFile);
  // console.log(JSON.stringify(rootModel, null, 2));
  const ctx = new Context({
    showBrowser: opt.showBrowser,
    metadata,
  });
  await ctx.init();

  await run(ctx, rootModel); 
  await ctx.shutdown();
}
