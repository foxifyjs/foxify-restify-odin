import { Query } from ".";
import filter from "./builders/filter";
import include from "./builders/include";
import limit from "./builders/limit";
import skip from "./builders/skip";
import sort from "./builders/sort";

export default (model: any, decoded: Query) => {
  if (decoded.include) model = include(model, decoded.include);

  if (decoded.filter) model = filter(model, decoded.filter);

  const counter = model;

  if (decoded.sort) model = sort(model, decoded.sort);

  if (decoded.skip) model = skip(model, decoded.skip);

  if (decoded.limit) model = limit(model, decoded.limit);

  return { counter, query: model };
};
