import { object } from "prototyped.js/es6/methods";

const { forEach: objectForEach, isPlainObject: isObject } = object;

const isArray = (value: any) => Array.isArray(value);

const isBoolean = (value: any) => value === "false" || value === "true";

const isNumber = (value: any) => !isNaN(parseFloat(value)) && isFinite(value);

const parseArray = (arr: any[]) => arr.map(value => parseValue(value));

const parseBoolean = (str: string) => str === "true";

const parseNumber = (str: string) => Number(str);

const parseValue = (val: any): any => {
  if (typeof val === "undefined" || val === "") return null;

  if (isBoolean(val)) return parseBoolean(val);

  if (isArray(val)) return parseArray(val);

  if (isObject(val)) return decoder(val);

  if (isNumber(val)) return parseNumber(val);

  return val;
};

const decoder = (query: { [key: string]: any }) => {
  const result: { [key: string]: any } = {};

  objectForEach(query, (value, key) => {
    value = parseValue(value);

    if (value !== null) result[key] = value;
  });

  return result;
};

export default decoder;
