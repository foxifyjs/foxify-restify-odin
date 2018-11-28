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

it("Should filter (1)", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        field: "age",
        operator: "eq",
        value: 22,
      },
    },
  )}`);

  const users = ITEMS.filter(({ age }) => age === 22);

  expect(JSON.parse(result.body))
    .toEqual({ users, total: users.length });
});

it("Should filter (2)", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        and: [
          {
            field: "age",
            operator: "eq",
            value: 22,
          },
          {
            field: "username",
            operator: "ne",
            value: "ardalan",
          },
        ],
      },
    },
  )}`);

  const users = ITEMS.filter(({ username, age }) => age === 22 && username !== "ardalan");

  expect(JSON.parse(result.body))
    .toEqual({ users, total: users.length });
});

it("Should filter (3)", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        or: [
          {
            field: "age",
            operator: "eq",
            value: 22,
          },
          {
            field: "username",
            operator: "ne",
            value: "ardalan",
          },
        ],
      },
    },
  )}`);

  const users = ITEMS.filter(({ username, age }) => age === 22 || username !== "ardalan");

  expect(JSON.parse(result.body))
    .toEqual({ users, total: users.length });
});

it("Should filter (4)", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        or: [
          {
            field: "age",
            operator: "eq",
            value: 22,
          },
          {
            and: [
              {
                field: "username",
                operator: "ne",
                value: "ardalan",
              },
              {
                field: "age",
                operator: "gte",
                value: 45,
              },
            ],
          },
        ],
      },
    },
  )}`);

  const users = ITEMS.filter(({ username, age }) => age === 22 || (
    username !== "ardalan" && age >= 45
  ));

  expect(JSON.parse(result.body))
    .toEqual({ users, total: users.length });
});

it("Should filter (5)", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        and: [
          {
            field: "age",
            operator: "eq",
            value: 22,
          },
          {
            or: [
              {
                field: "username",
                operator: "ne",
                value: "ardalan",
              },
              {
                field: "age",
                operator: "gte",
                value: 45,
              },
            ],
          },
        ],
      },
    },
  )}`);

  const users = ITEMS.filter(({ username, age }) => age === 22 && (
    username !== "ardalan" || age >= 45
  ));

  expect(JSON.parse(result.body))
    .toEqual({ users, total: users.length });
});

it("Should filter (6)", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        field: "name.first",
        operator: "lk",
        value: "arda",
      },
    },
  )}`);

  const users = ITEMS.filter(({ name }) => /arda/i.test(name.first));

  expect(JSON.parse(result.body))
    .toEqual({ users, total: users.length });
});
