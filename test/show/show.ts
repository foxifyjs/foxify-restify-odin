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
    age: Types.number.min(18).required,
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

it("Should show the user by the given id", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const user = ITEMS[0];

  const result = await app.inject(`/users/${(user as any).id}`);

  expect(JSON.parse(result.body))
    .toEqual({ user });
});

it("Should show the user by the given id including its age relation", async () => {
  expect.assertions(1);

  const app = new Foxify();

  app.use(restify(User));

  const user = ITEMS[0];

  (user as any).age = ITEMS2.filter(item => item.username === user.username)[0];

  const result = await app.inject(`/users/${(user as any).id}?${stringify(
    {
      include: [
        "age",
      ],
    },
  )}`);

  expect(JSON.parse(result.body))
    .toEqual({ user });
});
