import * as Odin from "@foxify/odin";
import * as DB from "@foxify/odin/dist/DB";
import * as Foxify from "foxify";
import { Router } from "foxify/framework/routing";
import * as pluralize from "prototyped.js/es6/string/pluralize/method";
import { IParseOptions,parse } from "qs";
import {
  count, delete as deleteController, index, responder, show, store, update,
} from "./controllers";
import decoder from "./decoder";
import query from "./query";

namespace restify {
  export type Operator = "lt" | "lte" | "eq" | "ne" | "gte" | "gt" |
    "exists" | "in" | "nin" | "bet" | "nbe" | "like" | "nlike";

  export interface FilterObject {
    field: string;
    operator: Operator;
    value: string | number | boolean | any[] | object | Date;
  }

  export interface Has {
    relation: string;
    filter: Filter;
    operator?: DB.Operator;
    count?: number;
  }

  export interface Filter {
    and?: Array<FilterObject | Filter>;
    or?: Array<FilterObject | Filter>;
    has?: string | Has;
  }

  export interface Query {
    filter?: Filter | FilterObject;
    include?: string[];
    sort?: string[];
    skip?: number;
    limit?: number;
  }

  export interface RouteOptions {
    pre?: Foxify.Handler | Foxify.Handler[];
    post?: Foxify.Handler | Foxify.Handler[];
  }

  export interface RoutesOptions {
    index: RouteOptions & { lean?: boolean; } | false;
    count: RouteOptions | false;
    store: RouteOptions | false;
    show: RouteOptions | false;
    update: RouteOptions | false;
    delete: RouteOptions | false;
  }

  export interface Options<P extends boolean = false> {
    name: string;
    prefix: string;
    qs: IParseOptions;
    defaults: Query;
    pre?: Foxify.Handler | Foxify.Handler[];
    routes: P extends true ? Partial<RoutesOptions> : RoutesOptions;
  }
}

const restify = (model: typeof Odin, options: Partial<restify.Options<true>> = {}) => {
  if (!(typeof model === typeof Odin)) {
    throw new TypeError("Expected model to be a Odin database model");
  }

  options = {
    name: model.toString(),
    prefix: "",
    ...options,
    qs: {
      depth: 100,
      ...(options.qs || {}),
    },
    defaults: {
      limit: 10,
      skip: 0,
      ...(options.defaults || {}),
    },
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

  const name = pluralize(options.name as string, 1);

  const foxifyRestifyOdin: (single?: boolean) => Foxify.Handler = (single = false) => {
    return function foxify_restify_odin(req, res, next) {
      const parsed = parse((req.url as string).replace(/^.*\?/, ""), options.qs);

      const decoded = Object.assign({}, options.defaults, decoder(parsed));

      req.fro = {
        decoded,
        ...query(model, decoded, single ? req.params[name] : false),
      };

      next();
    };
  };

  const router = new Router(`${options.prefix}/${options.name}`);

  const routes = options.routes as restify.Options["routes"];

  if (routes.index) {
    router.get(
      "",
      foxifyRestifyOdin(),
      options.pre as any,
      routes.index.pre as any,
      index(options as restify.Options),
      routes.index.post as any,
      responder,
    );
  }

  if (routes.count) {
    router.get(
      "/count",
      foxifyRestifyOdin(),
      options.pre as any,
      routes.count.pre as any,
      count(options as restify.Options),
      routes.count.post as any,
      responder,
    );
  }

  if (routes.store) {
    router.post(
      "",
      options.pre as any,
      routes.store.pre as any,
      store(model, options as restify.Options),
      routes.store.post as any,
      responder,
    );
  }

  if (routes.show) {
    router.get(
      `/:${name}`,
      foxifyRestifyOdin(true),
      options.pre as any,
      routes.show.pre as any,
      show(model, options as restify.Options),
      routes.show.post as any,
      responder,
    );
  }

  if (routes.update) {
    router.patch(
      `/:${name}`,
      options.pre as any,
      routes.update.pre as any,
      update(model, options as restify.Options),
      routes.update.post as any,
      responder,
    );
  }

  if (routes.delete) {
    router.delete(
      `/:${name}`,
      options.pre as any,
      routes.delete.pre as any,
      deleteController(model, options as restify.Options),
      routes.delete.post as any,
      responder,
    );
  }

  return router;
};

export = restify;
