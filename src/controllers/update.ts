import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import * as forEach from "prototyped.js/es6/object/forEach/method";
import * as capitalize from "prototyped.js/es6/string/capitalize/method";
import * as pluralize from "prototyped.js/es6/string/pluralize/method";
import { Options } from "..";

export default (model: typeof Odin, options: Options): Foxify.Handler => {
  const name = pluralize(options.name, 1);

  return async function foxify_restify_odin_update(req, res, next) {
    const id = req.params[name];

    let item: Odin;

    if (Odin.isOdin(id)) {
      item = id;
    } else {
      item = await model.find(id);

      if (!item) {
        const error = new Error(`${capitalize(name)} not found`);

        (error as any).code = 404;

        throw error;
      }
    }

    const body = req.body[name];

    forEach(body, (value, key) => {
      item[key] = value;
    });

    req.fro = {
      result: {
        [name]: await item.save(),
      },
    };

    next();
  };
};
