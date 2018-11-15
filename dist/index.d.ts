declare namespace restify {
    type Operator = "lt" | "lte" | "eq" | "ne" | "gte" | "gt" | "ex" | "in" | "nin" | "bet" | "nbe";
    interface FilterObject {
        field: string;
        operator: Operator;
        value: string | number | boolean | any[] | object | Date;
    }
    interface Filter {
        and?: Array<FilterObject | Filter>;
        or?: Array<FilterObject | Filter>;
    }
    interface Query {
        filter: Filter | FilterObject;
        include: string[];
        sort: string[];
        skip: number;
        limit: number;
    }
}
declare const restify: (model: import("@foxify/odin/dist/utils").ClassInterface & typeof import("@foxify/odin/dist/Model").default & typeof import("@foxify/odin/dist/base/QueryBuilder").default & typeof import("@foxify/odin/dist/base/Relational").default & typeof import("@foxify/odin/dist/GraphQL/Model").default) => import("foxify/framework/routing/Layer").Handler;
export = restify;
