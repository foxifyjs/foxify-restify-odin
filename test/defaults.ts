import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import "prototyped.js";
import { stringify } from "qs";
import * as restify from "../src";

declare global {
  namespace NodeJS {
    interface Global {
      __MONGO_DB_NAME__: string;
      __MONGO_CONNECTION__: any;
    }
  }
}

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
    if (err) throw err;

    Odin.DB.table(TABLE).get((err, items) => {
      if (err) throw err;

      ITEMS.length = 0;

      ITEMS.push(...items);

      done();
    });
  });
});

afterEach((done) => {
  Odin.DB.table(TABLE).delete((err) => {
    if (err) throw err;

    Odin.DB.table(TABLE).insert(ITEMS, (err) => {
      if (err) throw err;

      done();
    });
  });
});

afterAll((done) => {
  Odin.DB.table(TABLE).delete((err) => {
    if (err) throw err;

    done();
  });
});

interface User extends Odin { }

class User extends Odin {
  public static schema = {
    email: User.Types.String.email.required,
    username: User.Types.String.alphanum.min(3).required,
    age: User.Types.Number.min(18).required,
    name: {
      first: User.Types.String.min(3).required,
      last: User.Types.String.min(3),
    },
  };
}

it("Should limit 1 item by default", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User, { limit: 1 }), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users`);

  const users = ITEMS.initial();

  expect(JSON.parse(result.body))
    .toEqual({ users, total: ITEMS.length });
});

it("Should skip 1 item by default and sort by -age", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User, { skip: 1 }), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      sort: [
        "-age",
      ],
    },
  )}`);

  const users = ITEMS.orderBy("age", "desc").tail();

  expect(JSON.parse(result.body))
    .toEqual({ users, total: ITEMS.length });
});
