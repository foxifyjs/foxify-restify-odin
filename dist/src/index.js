"use strict";
const Odin = require("@foxify/odin");
const query_1 = require("./query");
const restify = (model) => {
    if (!(typeof model === typeof Odin)) {
        throw new TypeError("Expected model to be a Odin database model");
    }
    // tslint:disable-next-line:variable-name
    const foxify_restify_odin = (req, res, next) => {
        req.fro = query_1.default(model, req.url);
        next();
    };
    return foxify_restify_odin;
};
module.exports = restify;
