import * as Odin from "@foxify/odin";
import * as bodyParser from "body-parser";
import * as Foxify from "foxify";
import "prototyped.js";
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

beforeAll((done) => {
  User.insert(ITEMS, (err) => {
    if (err) throw err;

    User.lean().get((err2, items: any[]) => {
      if (err2) throw err2;

      ITEMS.length = 0;

      ITEMS.push(...items.map(item => ({
        ...item, created_at: item.created_at.toISOString() })));

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

it("Should update the user by the given id", async () => {
  expect.assertions(2);

  const app = new Foxify();

  app.use(
    bodyParser.json(),
    bodyParser.urlencoded({ extended: false }),
    restify(User),
  );

  const user = ITEMS[0];

  user.username = "updated";

  const saved = await app.inject({
    url: `/users/${(user as any).id}`,
    method: "PATCH",
    body: { user: { username: "updated" } },
  });

  expect({ user: JSON.parse(saved.body).user.$omit(["updated_at"]) })
    .toEqual({ user });

  (user as any).updated_at = JSON.parse(saved.body).user.updated_at;

  const users = [user].concat(ITEMS.tail());

  const result = await app.inject("/users");

  expect(JSON.parse(result.body))
    .toEqual({
      users,
      meta: { limit: 10, page: 0, count: users.length, total_count: users.length },
    });
});
