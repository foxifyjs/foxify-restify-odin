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

Odin.connections({
  default: {
    driver: "MongoDB",
    database: global.__MONGO_DB_NAME__,
    connection: global.__MONGO_CONNECTION__,
  },
});

beforeAll(async (done) => {
  await Odin.DB.table(TABLE).insert(ITEMS);

  const items = await Odin.DB.table(TABLE).get();

  ITEMS.length = 0;

  ITEMS.push(...items);

  await Odin.DB.table(TABLE2).insert(ITEMS2);

  const items2 = await Odin.DB.table(TABLE2).get();

  ITEMS2.length = 0;

  ITEMS2.push(...items2);

  done();
});

afterEach(async (done) => {
  await Odin.DB.table(TABLE).delete();

  await Odin.DB.table(TABLE).insert(ITEMS);

  await Odin.DB.table(TABLE2).delete();

  await Odin.DB.table(TABLE2).insert(ITEMS2);

  done();
});

afterAll(async (done) => {
  await Odin.DB.table(TABLE).delete();

  await Odin.DB.table(TABLE2).delete();

  done();
});

interface User extends Odin { }

class User extends Odin {
  public static schema = {
    email: User.Types.String.email.required,
    username: User.Types.String.alphanum.min(3).required,
    name: {
      first: User.Types.String.min(3).required,
      last: User.Types.String.min(3),
    },
  };

  public age() {
    return this.hasOne<Age>("Age", "username", "username");
  }
}

Odin.register(User);

interface Age extends Odin { }

// tslint:disable-next-line:max-classes-per-file
class Age extends Odin {
  public static schema = {
    username: User.Types.String.alphanum.min(3).required,
    age: User.Types.Number.min(18).required,
  };

  public user() {
    return this.hasOne<User>("User", "username", "username");
  }
}

Odin.register(Age);

it("Should include age", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.get("/users", restify(User as any), async (req, res) => {
    expect(req.fro).toBeDefined();

    res.json({
      users: await req.fro.query.get(),
      total: await req.fro.counter.count(),
    });
  });

  const result = await app.inject(`/users?${stringify(
    {
      include: [
        "age",
      ],
    },
  )}`);

  const users = ITEMS.map((item: any) => ({
    ...item,
    age: ITEMS2.find(item2 => item.username === item2.username),
  }));

  expect(JSON.parse(result.body))
    .toEqual({ users, total: users.length });
});
