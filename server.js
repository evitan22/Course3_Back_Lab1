const express = require("express");
const { User, sequelize } = require("./app.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

const users = []; // тимчасове сховище
const SECRET_KEY = "secret123";

sequelize.sync({ alter: true }).then(() => {
    console.log("Таблиці синхронізовано. Запускаємо сервер...");
    app.listen(3000, () => console.log("Сервер працює на порту 3000"));
});

// Реєстрація
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ message: "Всі поля обов'язкові" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Пароль занадто короткий" });
    }

    // Перевірка існування користувача
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: "Користувач вже існує" });

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword, name });

    res.status(201).json({ message: "Користувача створено" });
} catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Помилка сервера" });
}
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 2, // 5 спроб
    // Цей метод спрацює, коли ліміт буде вичерпано
    handler: (req, res, next, options) => {
    res.status(429).json({ 
        message: "Забагато невдалих спроб. Спробуйте через 15 хвилин." 
    });
    },
    standardHeaders: true, 
    legacyHeaders: false,
});

// Авторизація
app.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Користувача не знайдено" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Невірний пароль" });
    }

    const token = jwt.sign({ email, name: user.name, id: user.id }, SECRET_KEY, { expiresIn: "1m" });
    const refreshToken = jwt.sign({ email, name: user.name, id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

app.get("/profile", (req, res) => {
  const authHeader = req.headers["authorization"]; // 🔒 Захищений маршрут

  if (!authHeader) {
    return res.status(401).json({ message: "Немає токена" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    res.json({ message: "Доступ дозволено", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Невірний токен" });
  }
});

app.patch("/profile/:id", async (req, res) => {
  const authHeader = req.headers["authorization"]; // 🔒 Захищений маршрут
  const id = req.params.id; 
  const data = req.body;

  if (!authHeader) {
    return res.status(401).json({ message: "Немає токена" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ where: { id } });
    
    await User.update({ ...data }, {where:{id}});
    res.status(201).json({ message: "Користувача оновлено" });
  } catch (error) {
    res.status(401).json({ message: "Невірний токен" });
  }
});

app.post('/refresh', async (req, res) => {
    const refreshToken = req.headers["authorization"];
    if (!refreshToken) return res.sendStatus(401);

    const token = refreshToken.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(401);
        const token = jwt.sign({ email: decoded.email, name: decoded.name, id: decoded.id }, SECRET_KEY, { expiresIn: "1m" });
        res.json({ token });
    });
});

app.listen(3000, () => console.log("Сервер запущено на порту 3000"));