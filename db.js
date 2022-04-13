const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const Notes = conn.define("notes", {
  text: STRING,
});

const User = conn.define("user", {
  username: STRING,
  password: STRING,
});

Notes.belongsTo(User);
User.hasMany(Notes);

User.addHook("beforeSave", async (user) => {
  if (user.changed("password")) {
    const hashed = await bcrypt.hash(user.password, 3);
    user.password = hashed;
  }
});

// Notes.byToken = async (token) => {
//   try {
//     const payload = await jwt.verify(token, process.env.JWT);
//     const notes = await Notes.findAll({
//       where: {
//         userId: payload.id,
//       },
//     });

//     if (notes) {
//       return notes;
//     }
//     const error = Error("bad credentials");
//     error.status = 401;
//     throw error;
//   } catch (ex) {
//     const error = Error("bad credentials");
//     error.status = 401;
//     throw error;
//   }
// };

User.byToken = async (token) => {
  try {
    const payload = await jwt.verify(token, process.env.JWT);
    const user = await User.findByPk(payload.id, {
      attributes: {
        exclude: ["password"],
      },
    });
    if (user) {
      return user;
    }
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  } catch (ex) {
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  }
};

User.authenticate = async ({ username, password }) => {
  const user = await User.findOne({
    where: {
      username,
    },
  });
  if (user && (await bcrypt.compare(password, user.password))) {
    return jwt.sign({ id: user.id }, process.env.JWT);
  }
  const error = Error("bad credentials!!!!!!");
  error.status = 401;
  throw error;
};

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  await Notes.create({ text: "lucy's note", userId: lucy.id });
  await Notes.create({ text: "lucy's note 2", userId: lucy.id });
  await Notes.create({ text: "moe's note", userId: moe.id });
  await Notes.create({ text: "moe's note 2", userId: moe.id });
  await Notes.create({ text: "larry's note", userId: larry.id });
  await Notes.create({ text: "larry's note 2", userId: larry.id });
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Notes,
  },
};
