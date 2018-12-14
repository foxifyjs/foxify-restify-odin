import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import * as capitalize from "prototyped.js/es6/string/capitalize/method";
import * as pluralize from "prototyped.js/es6/string/pluralize/method";
import { Options } from "..";

export default (model: typeof Odin, options: Options): Foxify.Handler => {
  const name = pluralize(options.name, 1);

  return async function foxify_restify_odin_show(req, res, next) {
    const item = await req.fro.query.lean().first();

    if (!item) {
      const error = new Error(`${capitalize(name)} not found`);

      (error as any).code = 404;

      throw error;
    }

    req.fro = {
      result: {
        [name]: item,
      },
    };

    next();
  };
};
