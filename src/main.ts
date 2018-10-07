#!/usr/bin/env node

import { compile } from "./compile";
import { Context, run } from "./runner";

async function main() {
  const { rootModel } = compile("./example.yml");
  console.log(JSON.stringify(rootModel, null, 2));

  const ctx = new Context();
  await ctx.init();

  await run(ctx, rootModel); 
}

main();
