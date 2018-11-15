export default (model: any, sorts: string[]) => sorts.reduce(
  (prev, sort) => prev.orderBy(sort.replace(/^(\+|\-)/, ""), /^\-/.test(sort) ? "desc" : "asc"),
  model,
);
