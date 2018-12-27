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
    name: {
      first: "Ardalan",
      last: "Amini",
    },
  },
  {
    email: "johndue@example.com",
    username: "john",
    name: {
      first: "John",
      last: "Due",
    },
  },
];

const TABLE2 = "ages";
const ITEMS2 = [
  {
    username: "ardalanamini",
    age: 22,
  },
  {
    username: "john",
    age: 45,
  },
];

Odin.Connect({
  default: {
    database: global.__MONGO_DB_NAME__,
    connection: global.__MONGO_CONNECTION__,
  },
});

beforeAll(async (done) => {
  await Odin.DB.collection(TABLE).insert(ITEMS);

  const items = await Odin.DB.collection(TABLE).get();

  ITEMS.length = 0;

  ITEMS.push(...items);

  await Odin.DB.collection(TABLE2).insert(ITEMS2);

  const items2 = await Odin.DB.collection(TABLE2).get();

  ITEMS2.length = 0;

  ITEMS2.push(...items2);

  done();
});

afterEach(async (done) => {
  await Odin.DB.collection(TABLE).delete();

  await Odin.DB.collection(TABLE).insert(ITEMS);

  await Odin.DB.collection(TABLE2).delete();

  await Odin.DB.collection(TABLE2).insert(ITEMS2);

  done();
});

afterAll(async (done) => {
  await Odin.DB.collection(TABLE).delete();

  await Odin.DB.collection(TABLE2).delete();

  done();
});

const Types = Odin.Types;

@Odin.register
class User extends Odin {
  public static schema = {
    email: Types.string.email.required,
    username: Types.string.alphanum.min(3).required,
    name: {
      first: Types.string.min(3).required,
      last: Types.string.min(3),
    },
  };

  @Odin.relation
  public age() {
    return this.hasOne<Age>("Age", "username", "username");
  }
}

// tslint:disable-next-line:max-classes-per-file
@Odin.register
class Age extends Odin {
  public static schema = {
    username: Types.string.alphanum.min(3).required,
    age: Types.number.min(18).required,
  };

  @Odin.relation
  public user() {
    return this.hasOne<User>("User", "username", "username");
  }
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
        field: "username",
        operator: "eq",
        value: "ardalanamini",
      },
    },
  )}`);

  const users = ITEMS.filter(({ username }) => username === "ardalanamini");

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
            field: "name.first",
            operator: "eq",
            value: "John",
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

  const users = ITEMS
    .filter(({ username, name }) => name.first === "John" && username !== "ardalan");

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
            field: "name.last",
            operator: "eq",
            value: "Amini",
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

  const users = ITEMS
    .filter(({ username, name }) => name.last === "Amini" || username !== "ardalan");

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
            field: "name.first",
            operator: "ne",
            value: "Ardalan",
          },
          {
            and: [
              {
                field: "username",
                operator: "ne",
                value: "ardalan",
              },
              {
                field: "name.last",
                operator: "eq",
                value: "Due",
              },
            ],
          },
        ],
      },
    },
  )}`);

  const users = ITEMS.filter(({ username, name }) => name.first !== "Ardalan" || (
    username !== "ardalan" && name.last === "Due"
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
            field: "name.first",
            operator: "eq",
            value: "Ardalan",
          },
          {
            or: [
              {
                field: "username",
                operator: "ne",
                value: "ardalan",
              },
              {
                field: "name.last",
                operator: "eq",
                value: "Due",
              },
            ],
          },
        ],
      },
    },
  )}`);

  const users = ITEMS.filter(({ username, name }) => name.first === "Ardalan" && (
    username !== "ardalan" || name.last === "Due"
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

it("Should filter [has]", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        has: "age",
      },
    },
  )}`);

  const users = ITEMS.filter(({ username }) => ITEMS2.any(item => item.username === username));

  expect(JSON.parse(result.body))
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter [has inside first level and]", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        and: [
          {
            has: "age",
          },
        ],
      },
    },
  )}`);

  const users = ITEMS.filter(({ username }) => ITEMS2.any(item => item.username === username));

  expect(JSON.parse(result.body))
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter [whereHas]", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        has: {
          relation: "age",
          filter: {
            field: "age",
            operator: "gte",
            value: 25,
          },
        },
      },
    },
  )}`);

  const users = ITEMS
    .filter(({ username }) => ITEMS2.any(item => item.username === username && item.age >= 25));

  expect(JSON.parse(result.body))
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});

it("Should filter [whereHas inside first level and]", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const result = await app.inject(`/users?${stringify(
    {
      filter: {
        and: [
          {
            has: {
              relation: "age",
              filter: {
                field: "age",
                operator: "gte",
                value: 25,
              },
            },
          },
        ],
      },
    },
  )}`);

  const users = ITEMS
    .filter(({ username }) => ITEMS2.any(item => item.username === username && item.age >= 25));

  expect(JSON.parse(result.body))
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});
