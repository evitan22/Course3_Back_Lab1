const sequelize = require('./config/database');
const User = require('./models/User');
const Post = require('./models/Post');
User.hasMany(Post);
Post.belongsTo(User);

async function startApp() {
    try {
        await sequelize.authenticate();
        console.log('З’єднання з MySQL встановлено через mysql2!');

        await sequelize.sync({ force: true });
        console.log('Таблиці в базі оновлено.');
    } catch (error) {
        console.error('Помилка підключення:', error.message);
    }
}

async function run() {
    await startApp();           
}
module.exports = { User, Post, sequelize }