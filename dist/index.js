"use strict";
const Odin = require("@foxify/odin");
const qs_1 = require("qs");
const decoder_1 = require("./decoder");
const query_1 = require("./query");
const restify = (model) => {
    if (!(typeof model === typeof Odin)) {
        throw new TypeError("Expected model to be a Odin database model");
    }
    // tslint:disable-next-line:variable-name
    const foxify_restify_odin = (req, res, next) => {
        const parsed = qs_1.parse(req.url.replace(/^.*\?/, ""));
        const decoded = decoder_1.default(parsed);
        req.fro = Object.assign({ decoded }, query_1.default(model, decoded));
        next();
    };
    return foxify_restify_odin;
};
module.exports = restify;
