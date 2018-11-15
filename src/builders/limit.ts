import * as Odin from "@foxify/odin";

export default (model: typeof Odin | Odin, limit: number) => model.limit(limit);
