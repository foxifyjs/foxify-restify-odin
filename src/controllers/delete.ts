import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import * as capitalize from "prototyped.js/es6/string/capitalize/method";
import * as pluralize from "prototyped.js/es6/string/pluralize/method";
import { Options } from "..";

export default (model: typeof Odin, options: Options): Foxify.Handler => {
  const name = pluralize(options.name, 1);
  const capitalized = capitalize(name);

  return async function foxify_restify_odin_delete(req, res, next) {
    const id = req.params[name];

    if (Odin.isOdin(id)) await model.destroy(id.id as string);
    else await model.destroy(id);

    req.fro = {
      result: {
        message: `${capitalized} deleted successfully`,
      },
    };

    next();
  };
};
