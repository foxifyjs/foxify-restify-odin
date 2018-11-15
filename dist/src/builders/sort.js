"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (model, sorts) => sorts.reduce((prev, sort) => prev.orderBy(sort.replace(/^(\+|\-)/, ""), /^\-/.test(sort) ? "desc" : "asc"), model);
