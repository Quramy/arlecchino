#!/usr/bin/env node

import { load, createRootModel } from "./compile";
import { Context, run } from "./runner";

async function main() {
  const rootSchema = load("./example.yml");
  const rootModel = createRootModel(rootSchema);
  console.log(JSON.stringify(rootModel, null, 2));

  const ctx = new Context();
  await ctx.init();

  await run(ctx, rootModel); 
}

main();
