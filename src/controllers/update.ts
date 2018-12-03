import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import * as forEach from "prototyped.js/es6/object/forEach/method";
import * as pluralize from "prototyped.js/es6/string/pluralize/method";
import { Options } from "..";

export default (model: typeof Odin, options: Options): Foxify.Handler => {
  const name = pluralize(options.name, 1);

  return async function foxify_restify_odin_update(req, res, next) {
    const id = req.params[name];
    const body = req.body[name];

    const item = Odin.isOdin(id) ? id : await model.find(id);

    forEach(body, (value, key) => {
      item[key] = value;
    });

    req.fro.result = {
      [name]: await item.save(),
    };

    next();
  };
};
