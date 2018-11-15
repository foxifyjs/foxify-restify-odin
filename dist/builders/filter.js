"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASIC_OPERATORS = {
    eq: "=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    ne: "<>",
};
const operate = (query, field, operator, value) => {
    switch (operator) {
        case "lt":
        case "lte":
        case "eq":
        case "ne":
        case "gte":
        case "gt":
            return query.where(field, BASIC_OPERATORS[operator], value);
        case "ex":
            if (value === true)
                return query.whereNotNull(field);
            return query.whereNull(field);
        case "in":
            return query.whereIn(field, value);
        case "nin":
            return query.whereNotIn(field, value);
        case "bet":
            return query.whereBetween(field, value[0], value[1]);
        case "nbe":
            return query.whereNotBetween(field, value[0], value[1]);
        default:
            throw new TypeError("Unknown operator");
    }
};
const and = (query, filters) => filters
    .reduce((prev, curr) => prev.where((q) => filter(q, curr)), query);
const or = (query, filters) => filters.reduce((prev, curr, index) => {
    if (index === 0)
        return prev.where((q) => filter(q, curr));
    return prev.orWhere((q) => filter(q, curr));
}, query);
const filter = (model, filters) => {
    if (filters.and) {
        if (filters.or)
            throw new TypeError("filter can only have one of [\"and\", \"or\"]");
        return and(model, filters.and);
    }
    if (filters.or)
        return or(model, filters.or);
    return operate(model, filters.field, filters.operator, filters.value);
};
exports.default = filter;
