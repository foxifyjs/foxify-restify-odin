import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import { parse } from "qs";
import decoder from "./decoder";
import query from "./query";

namespace restify {
  export type Operator = "lt" | "lte" | "eq" | "ne" | "gte" | "gt" |
    "ex" | "in" | "nin" | "bet" | "nbe";

  export interface FilterObject {
    field: string;
    operator: Operator;
    value: string | number | boolean | any[] | object | Date;
  }

  export interface Filter {
    and?: Array<FilterObject | Filter>;
    or?: Array<FilterObject | Filter>;
  }

  export interface Query {
    filter: Filter | FilterObject;
    include: string[];
    sort: string[];
    skip: number;
    limit: number;
  }
}

const restify = (model: typeof Odin) => {
  if (!(typeof model === typeof Odin)) {
    throw new TypeError("Expected model to be a Odin database model");
  }

  // tslint:disable-next-line:variable-name
  const foxify_restify_odin: Foxify.Handler = (req, res, next) => {
    const parsed = parse((req.url as string).replace(/^.*\?/, ""));

    const decoded = decoder(parsed) as restify.Query;

    req.fro = {
      decoded,
      ...query(model, decoded),
    };

    next();
  };

  return foxify_restify_odin;
};

export = restify;
