import * as sql from 'mssql';
// import * as dotenv from 'dotenv';

// dotenv.config();

const config: sql.config = {
  user: 'SA',
  password: 'MyStr0ngP@ssword',
  server: 'localhost',
  database: 'moex-candle',
  port: 1433,
  options: {
    encrypt: false, 
    trustServerCertificate: true,
  },
};

async function main() {
  try {
    await sql.connect(config);
    console.log('Успешное подключение к MSSQL!');

    const result = await sql.query('SELECT GETDATE() AS CurrentTime');
    console.log('Текущее время на сервере:', result.recordset[0].CurrentTime);
  } catch (err) {
    console.error('Ошибка подключения или запроса:', err);
  } 
}

main(); 