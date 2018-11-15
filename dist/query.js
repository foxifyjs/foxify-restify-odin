"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filter_1 = require("./builders/filter");
const include_1 = require("./builders/include");
const limit_1 = require("./builders/limit");
const skip_1 = require("./builders/skip");
const sort_1 = require("./builders/sort");
exports.default = (model, decoded) => {
    if (decoded.include)
        model = include_1.default(model, decoded.include);
    if (decoded.filter)
        model = filter_1.default(model, decoded.filter);
    const counter = model;
    if (decoded.sort)
        model = sort_1.default(model, decoded.sort);
    if (decoded.skip)
        model = skip_1.default(model, decoded.skip);
    if (decoded.limit)
        model = limit_1.default(model, decoded.limit);
    return { counter, query: model };
};
