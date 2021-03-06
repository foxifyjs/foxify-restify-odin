import * as Odin from "@foxify/odin";
import { string } from "prototyped.js/es6/methods";
import { Filter, FilterObject, Operator } from "..";

const BASIC_OPERATORS: { [key: string]: any } = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  ne: "<>",
};

const operate = (query: typeof Odin, field: string, operator: Operator, value: any) => {
  switch (operator) {
    case "lt":
    case "lte":
    case "eq":
    case "ne":
    case "gte":
    case "gt":
      return query.where(field, BASIC_OPERATORS[operator], value);
    case "exists":
      if (value === true) return query.whereNotNull(field);
      return query.whereNull(field);
    case "in":
      return query.whereIn(field, value);
    case "nin":
      return query.whereNotIn(field, value);
    case "bet":
      return query.whereBetween(field, value[0], value[1]);
    case "nbe":
      return query.whereNotBetween(field, value[0], value[1]);
    case "like":
      return query.whereLike(field, value);
    case "nlike":
      return query.whereNotLike(field, value);
    default:
      throw new TypeError("Unknown operator");
  }
};

const and = (
  query: any, filters: Array<FilterObject | Filter>, had: boolean, level: number,
): any => filters
  .reduce(
    (prev, curr) => {
      if ((curr as any).has) return filter(prev, curr, had, level);

      return prev.where((q: any) => filter(q, curr, had, level + 1));
    },
    query,
  );

const or = (
  query: any, filters: Array<FilterObject | Filter>, had: boolean, level: number,
): any => filters.reduce(
  (prev, curr, index) => {
    if (index === 0) return prev.where((q: any) => filter(q, curr, had, level + 1));

    return prev.orWhere((q: any) => filter(q, curr, had, level + 1));
  },
  query,
);

const has = (
  query: typeof Odin,
  relation: string | { relation: string, filter: any, operator?: string, count?: number },
): any => {
  if (string.isString(relation)) return query.has(relation);

  return query.whereHas(
    relation.relation,
    q => filter(q, relation.filter, true),
    relation.operator as any,
    relation.count,
  );
};

const filter = (model: any, filters: any, had = false, level = 0) => {
  if (filters.and) {
    if (filters.or || filters.has) {
      throw new TypeError("filter can only have one of [\"and\", \"or\", \"has\"]");
    }

    return and(model, filters.and, had, level);
  }

  if (filters.or) {
    if (filters.has) throw new TypeError("filter can only have one of [\"and\", \"or\", \"has\"]");

    return or(model, filters.or, had, level);
  }

  if (filters.has) {
    if (had) throw new Error("Can't use \"has\" inside has");
    if (level !== 0) throw new Error("Can't use \"has\" at this level");

    return has(model, filters.has);
  }

  return operate(model, filters.field, filters.operator, filters.value);
};

export default filter;
