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

it("Should sort by age [asc]", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const result = await app.inject(`/users?${stringify(
    {
      sort: [
        "age",
      ],
    },
  )}`);

  const users = ITEMS.orderBy("age");

  expect(JSON.parse(result.body))
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: ITEMS.length },
    });
});

it("Should sort by age [desc]", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const result = await app.inject(`/users?${stringify(
    {
      sort: [
        "-age",
      ],
    },
  )}`);

  const users = ITEMS.orderBy("age", "desc");

  expect(JSON.parse(result.body))
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: ITEMS.length },
    });
});
