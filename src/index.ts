import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import { parse } from "qs";
import { index, responder } from "./controllers";
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

  export interface RouteOptions {
    lean?: boolean;
    pre?: Foxify.Handler;
    post?: Foxify.Handler;
  }

  export interface Options {
    name: string;
    prefix: string;
    defaults: Query;
    routes: {
      index: RouteOptions | false;
      count: RouteOptions | false;
      store: RouteOptions | false;
      show: RouteOptions | false;
      update: RouteOptions | false;
      delete: RouteOptions | false;
    };
  }
}

const restify = (model: typeof Odin, options: Partial<restify.Options> = {}) => {
  if (!(typeof model === typeof Odin)) {
    throw new TypeError("Expected model to be a Odin database model");
  }

  options = {
    name: model.name,
    prefix: "",
    defaults: {
      limit: 0,
      skip: 0,
    },
    ...options,
    routes: {
      index: {},
      count: {},
      store: {},
      show: {},
      update: {},
      delete: {},
      ...(options.routes || {}),
    },
  };

  // tslint:disable-next-line:variable-name
  const foxifyRestifyOdin: Foxify.Handler = function foxify_restify_odin(req, res, next) {
    const parsed = parse((req.url as string).replace(/^.*\?/, ""));

    const decoded = Object.assign({}, options.defaults, decoder(parsed));

    req.fro = {
      decoded,
      ...query(model, decoded),
    };

    next();
  };

  const router = new Foxify.Router(`/${options.name}`);

  const routes = options.routes as restify.Options["routes"];

  if (routes.index) {
    router.get(
      "",
      foxifyRestifyOdin,
      routes.index.pre as any,
      index(options as restify.Options),
      routes.index.post as any,
      responder,
    );
  }

  return foxifyRestifyOdin;
};

export = restify;
