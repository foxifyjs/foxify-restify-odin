import { Query } from ".";
import { filter, include, limit, skip, sort } from "./builders";

export default (model: any, decoded: Query, single: string | false) => {
  let counter = model;

  if (decoded.include) model = include(model, decoded.include);

  if (single === false) {
    if (decoded.filter) {
      model = filter(model, decoded.filter);
      counter = filter(counter, decoded.filter);
    }

    // const counter = model;

    if (decoded.sort) model = sort(model, decoded.sort);

    if (decoded.skip) model = skip(model, decoded.skip);

    if (decoded.limit) model = limit(model, decoded.limit);
  } else model = model.where("id", single);

  return { counter, query: model };
};
