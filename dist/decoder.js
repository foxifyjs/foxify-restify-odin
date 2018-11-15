"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const methods_1 = require("prototyped.js/es6/methods");
const { forEach: objectForEach, isPlainObject: isObject } = methods_1.object;
const isArray = (value) => Array.isArray(value);
const isBoolean = (value) => value === "false" || value === "true";
const isNumber = (value) => !isNaN(parseFloat(value)) && isFinite(value);
const parseArray = (arr) => arr.map(value => parseValue(value));
const parseBoolean = (str) => str === "true";
const parseNumber = (str) => Number(str);
const parseValue = (val) => {
    if (typeof val === "undefined" || val === "")
        return null;
    if (isBoolean(val))
        return parseBoolean(val);
    if (isArray(val))
        return parseArray(val);
    if (isObject(val))
        return decoder(val);
    if (isNumber(val))
        return parseNumber(val);
    return val;
};
const decoder = (query) => {
    const result = {};
    objectForEach(query, (value, key) => {
        value = parseValue(value);
        if (value !== null)
            result[key] = value;
    });
    return result;
};
exports.default = decoder;
