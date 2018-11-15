import * as Odin from "@foxify/odin";

export default (model: typeof Odin, relations: string[]) => model.with(...relations);
