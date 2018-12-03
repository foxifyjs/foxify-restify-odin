import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import * as pluralize from "prototyped.js/es6/string/pluralize/method";
import { Options } from "..";

export default (model: typeof Odin, options: Options): Foxify.Handler => {
  const name = pluralize(options.name, 1);

  return async function foxify_restify_odin_store(req, res, next) {
    const item = new model(req.body[name]);

    req.fro.result = {
      [name]: await item.save(),
    };

    next();
  };
};
