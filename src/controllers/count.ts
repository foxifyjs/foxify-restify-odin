import * as Foxify from "foxify";
import { Options } from "..";

export default (options: Options): Foxify.Handler => {
  const name = options.name;

  return async function foxify_restify_odin_count(req, res, next) {
    req.fro.result = {
      [name]: await req.fro.counter.count(),
    };

    next();
  };
};
