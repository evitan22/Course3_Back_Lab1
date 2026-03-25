const sequelize = require('./config/database');
const User = require('./models/User');
const Post = require('./models/Post');
User.hasMany(Post);
Post.belongsTo(User);

const mysql = require('mysql2/promise');

async function startApp() {
    try {
        await sequelize.authenticate();
        console.log('З’єднання з MySQL встановлено через mysql2!');

        await sequelize.sync({ alter: true }); 
        console.log('Таблиці в базі оновлено.');

        await User.create({
            name: "Kyryl",
            email: "post@gmail.com"
        });
        await User.create({
            name: "Anatoliy",
            email: "krutoy@gmail.com"
        });

        await Post.create({
            title: 'My first post',
            content:'Hello world',
            UserId: 1
        });
        await Post.create({
            title: 'Im a programmer',
            content:'I likee coding',
            UserId: 2
        });
        await Post.create({
            title: 'second post',
            content:'Hm testing',
            UserId: 2
        });

//--------------------------------------------------------------------------------------------------------------

        const post = await Post.findByPk(3);
        console.log(post);

        await Post.update(
            {title:'Updated post'},
            {where:{id:2}}
        );
        
        // await Post.destroy({
        //     where:{id:1}
        // });
    } catch (error) {
        console.error('Помилка підключення:', error.message);
    }
}

async function InsertSQLCommands() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'MyDatabase',
        password: '1234'
    });

    await connection.execute(
        'INSERT INTO Users (name, email, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
        ['Anastasia', 'nk@gmail.com']
    );

    const [rows] = await connection.execute('SELECT * FROM users');
    rows.forEach(element => console.log(element));

    await connection.execute(
        'UPDATE Posts SET title = ?, content = ?, updatedAt = NOW() WHERE id = ?',
        ['SQL updated title', 'One more update', 3]
    );

    // await connection.execute(
    //     'DELETE FROM Posts WHERE id = ?',
    //     [3]
    // );
}

async function run() {
    await startApp();          
    await InsertSQLCommands(); 
}
run();