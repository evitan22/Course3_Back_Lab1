const sequelize = require('./config/database');
const User = require('./models/User');

async function startApp() {
    try {
        await sequelize.authenticate();
        console.log('✅ З’єднання з MySQL встановлено через mysql2!');

        await sequelize.sync({ alter: true }); 
        console.log('✅ Таблиці в базі оновлено.');

        const newUser = await User.create({
            name: "Petro",
            email: "petro@gmail.com"
        });
        console.log('✅ Користувача Petro додано в базу!');

    } catch (error) {
        console.error('❌ Помилка підключення:', error.message);
    }
}

startApp();