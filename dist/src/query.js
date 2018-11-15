"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = require("qs");
const filter_1 = require("./builders/filter");
const include_1 = require("./builders/include");
const limit_1 = require("./builders/limit");
const skip_1 = require("./builders/skip");
const sort_1 = require("./builders/sort");
const decoder_1 = require("./decoder");
const query = (model, url) => {
    url = url.replace(/^.*\?/, "");
    const parsed = qs_1.parse(url);
    const decoded = decoder_1.default(parsed);
    if (decoded.include)
        model = include_1.default(model, decoded.include);
    if (decoded.filter)
        model = filter_1.default(model, decoded.filter);
    if (decoded.sort)
        model = sort_1.default(model, decoded.sort);
    if (decoded.skip)
        model = skip_1.default(model, decoded.skip);
    if (decoded.limit)
        model = limit_1.default(model, decoded.limit);
    return model;
};
exports.default = query;
const test = `/test?${qs_1.stringify({
    filter: {
        and: [
            {
                field: "age",
                operator: ">=",
                value: 18,
            },
            {
                field: "type",
                operator: "?",
                value: true,
            },
            {
                or: [
                    {
                        field: "username",
                        operator: "=",
                        value: "ardalanamini",
                    },
                    {
                        field: "email",
                        operator: "!=",
                        value: "ardalanamini22@gmail.com",
                    },
                ],
            },
        ],
    },
    include: [
        "jobs",
        "offers",
    ],
    limit: 10,
    skip: 10,
    sort: [
        "age",
        "-created_at",
    ],
})}`;
