import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import * as pluralize from "prototyped.js/es6/string/pluralize/method";
import { Options } from "..";

export default (model: typeof Odin, options: Options): Foxify.Handler => {
  const name = pluralize(options.name, 1);

  return async function foxify_restify_odin_show(req, res, next) {
    const id = req.params[name];

    req.fro.result = {
      [name]: Odin.isOdin(id) ? id : await model.find(id),
    };

    next();
  };
};
