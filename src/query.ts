import * as Odin from "@foxify/odin";
import { Query } from ".";
import { filter, include, limit, skip, sort } from "./builders";

export default (model: any, decoded: Query, single: string | Odin | false) => {
  let counter = model;

  if (decoded.include) model = include(model, decoded.include);

  if (single === false) {
    if (decoded.filter) {
      model = filter(model, decoded.filter);
      counter = filter(counter, decoded.filter);
    }

    if (decoded.sort) model = sort(model, decoded.sort);

    if (decoded.skip) model = skip(model, decoded.skip);

    if (decoded.limit) model = limit(model, decoded.limit);
  } else {
    if (Odin.isOdin(single)) model = model.where("id", single.id);
    else model = model.where("id", single);
  }

  return { counter, query: model };
};
