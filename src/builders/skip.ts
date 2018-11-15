import * as Odin from "@foxify/odin";

export default (model: typeof Odin | Odin, skip: number) => model.skip(skip);
