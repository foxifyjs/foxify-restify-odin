import * as Odin from "@foxify/odin";
import * as Foxify from "foxify";
import "prototyped.js";
import { stringify } from "qs";
import * as restify from "../../src";

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

Odin.Connect({
  default: {
    database: global.__MONGO_DB_NAME__,
    connection: global.__MONGO_CONNECTION__,
  },
});

beforeAll((done) => {
  Odin.DB.collection(TABLE).insert(ITEMS, (err) => {
    if (err) throw err;

    Odin.DB.collection(TABLE).get((err2, items) => {
      if (err2) throw err2;

      ITEMS.length = 0;

      ITEMS.push(...items);

      done();
    });
  });
});

afterEach((done) => {
  Odin.DB.collection(TABLE).delete((err) => {
    if (err) throw err;

    Odin.DB.collection(TABLE).insert(ITEMS, (err2) => {
      if (err2) throw err2;

      done();
    });
  });
});

afterAll((done) => {
  Odin.DB.collection(TABLE).delete((err) => {
    if (err) throw err;

    done();
  });
});

const Types = Odin.Types;

class User extends Odin {
  public static schema = {
    email: Types.string.email.required,
    username: Types.string.alphanum.min(3).required,
    age: Types.number.min(18).required,
    name: {
      first: Types.string.min(3).required,
      last: Types.string.min(3),
    },
  };
}

it("Should filter (1)", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User, {
    routes: { count: false, store: false, show: false, update: false, delete: false },
  }));

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
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter (2)", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

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
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter (3)", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

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
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter (4)", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

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
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter (5)", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

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
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter (6)", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

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
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});
