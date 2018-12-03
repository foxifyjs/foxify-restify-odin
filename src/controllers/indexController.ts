import * as Foxify from "foxify";
import { Options, RouteOptions } from "..";

export default (options: Options): Foxify.Handler => {
  const index = options.routes.index as RouteOptions & { lean?: boolean; };
  const name = options.name;
  let execQuery = (q: any) => q.get();

  if (index.lean || !!index.post) execQuery = (q: any) => q.lean().get();

  return async function foxify_restify_odin_index(req, res, next) {
    const { query, decoded, counter } = req.fro;
    const items = await execQuery(query);

    const limit = decoded.limit;

    req.fro.result = {
      [name]: items,
      meta: {
        limit,
        page: Math.floor(decoded.skip / limit),
        page_count: items.length,
        total_count: await counter.count(),
      },
    };

    next();
  };
};
