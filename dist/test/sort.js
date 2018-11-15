"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Odin = require("@foxify/odin");
const Foxify = require("foxify");
require("prototyped.js");
const qs_1 = require("qs");
const restify = require("../src");
const TABLE = "users";
const ITEMS = [
    {
        email: "ardalanamini22@gmail.com",
        username: "ardalanamini",
        age: 22,
        name: {
            first: "Ardalan",
            last: "Amini",
        },
    },
    {
        email: "johndue@example.com",
        username: "john",
        age: 45,
        name: {
            first: "John",
            last: "Due",
        },
    },
];
Odin.connections({
    default: {
        driver: "MongoDB",
        database: global.__MONGO_DB_NAME__,
        connection: global.__MONGO_CONNECTION__,
    },
});
beforeAll((done) => {
    Odin.DB.table(TABLE).insert(ITEMS, (err) => {
        if (err)
            throw err;
        Odin.DB.table(TABLE).get((err, items) => {
            if (err)
                throw err;
            ITEMS.length = 0;
            ITEMS.push(...items);
            done();
        });
    });
});
afterEach((done) => {
    Odin.DB.table(TABLE).delete((err) => {
        if (err)
            throw err;
        Odin.DB.table(TABLE).insert(ITEMS, (err) => {
            if (err)
                throw err;
            done();
        });
    });
});
afterAll((done) => {
    Odin.DB.table(TABLE).delete((err) => {
        if (err)
            throw err;
        done();
    });
});
class User extends Odin {
}
User.schema = {
    email: User.Types.String.email.required,
    username: User.Types.String.alphanum.min(3).required,
    age: User.Types.Number.min(18).required,
    name: {
        first: User.Types.String.min(3).required,
        last: User.Types.String.min(3),
    },
};
it("Should sort by age [asc]", () => __awaiter(this, void 0, void 0, function* () {
    expect.assertions(2);
    const app = new Foxify();
    app.get("/users", restify(User), (req, res) => __awaiter(this, void 0, void 0, function* () {
        expect(req.fro).toBeDefined();
        res.json(yield req.fro.get());
    }));
    const result = yield app.inject(`/users?${qs_1.stringify({
        sort: [
            "age",
        ],
    })}`);
    expect(JSON.parse(result.body)).toEqual(ITEMS.orderBy("age"));
}));
it("Should sort by age [desc]", () => __awaiter(this, void 0, void 0, function* () {
    expect.assertions(2);
    const app = new Foxify();
    app.get("/users", restify(User), (req, res) => __awaiter(this, void 0, void 0, function* () {
        expect(req.fro).toBeDefined();
        res.json(yield req.fro.get());
    }));
    const result = yield app.inject(`/users?${qs_1.stringify({
        sort: [
            "-age",
        ],
    })}`);
    expect(JSON.parse(result.body)).toEqual(ITEMS.orderBy("age", "desc"));
}));
