import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import { parse } from "qs";
import decoder from "./decoder";
import query from "./query";

namespace restify {
  export type Operator = "lt" | "lte" | "eq" | "ne" | "gte" | "gt" |
    "ex" | "in" | "nin" | "bet" | "nbe" | "lk" | "nlk";

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
    filter?: Filter | FilterObject;
    include?: string[];
    sort?: string[];
    skip?: number;
    limit?: number;
  }
}

const restify = (model: typeof Odin, defaults: restify.Query = {}) => {
  if (!(typeof model === typeof Odin)) {
    throw new TypeError("Expected model to be a Odin database model");
  }

  // tslint:disable-next-line:variable-name
  const foxifyRestifyOdin: Foxify.Handler = function foxify_restify_odin(req, res, next) {
    const parsed = parse((req.url as string).replace(/^.*\?/, ""));

    const decoded = Object.assign({}, defaults, decoder(parsed));

    req.fro = {
      decoded,
      ...query(model, decoded),
    };

    next();
  };

  return foxifyRestifyOdin;
};

export = restify;
