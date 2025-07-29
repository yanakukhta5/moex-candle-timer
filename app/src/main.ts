import * as sql from 'mssql';
import cron from 'node-cron';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: String(process.env.DB_SERVER),
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: false, 
    trustServerCertificate: true,
  },
};

async function saveCandlesToDb(candles: any[], pool: sql.ConnectionPool) {
  try {
    // Создаем таблицу для передачи данных в хранимую процедуру
    const table = new sql.Table('CandleTableType');
    
    // Добавляем колонки в том же порядке, что и в типе
    table.columns.add('security', sql.VarChar(50), { nullable: false });
    table.columns.add('begin', sql.DateTime, { nullable: false });
    table.columns.add('open', sql.Float, { nullable: false });
    table.columns.add('close', sql.Float, { nullable: false });
    table.columns.add('high', sql.Float, { nullable: false });
    table.columns.add('low', sql.Float, { nullable: false });
    table.columns.add('volume', sql.Float, { nullable: false });

    // Добавляем данные в таблицу
    for (const candle of candles) {
      table.rows.add(
        process.env.SECURITY, // security
        new Date(candle.at(-1)), // begin
        candle.at(0),
        candle.at(1),
        candle.at(2),
        candle.at(3),
        candle.at(5)
      );
    }

    // Вызываем хранимую процедуру
    const request = pool.request();
    request.input('CandlesData', table);
    
    const result = await request.execute('sp_SaveCandlesBatch');
    
    console.log(`Сохранено записей: ${result.recordset[0]?.RowsAffected || 0}`);

    const test = await pool.query('SELECT * FROM candles;');
    console.log(test.recordset);

    // TODO: check begin format, сейчас там будто лишняя инфа
    
    return result;
  } catch (error) {
    console.error('Ошибка при сохранении свечей в БД:', error);
    throw error;
  }
}

async function connectToDb() {
  try {
    const pool = await sql.connect(config);
    console.log('Успешное подключение к MSSQL!');
    return pool;
  } catch (err) {
    console.error('Ошибка подключения к БД:', err);
    throw err;
  } 
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Получаем сервис для работы с MOEX
  const moexService = app.get('MoexService');
  
  try {
    // Подключаемся к БД
    const pool = await connectToDb();
    
    // Получаем свечи за текущий день
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const till = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const candles = await moexService.getCandles(process.env.SECURITY, from, till);
    
    console.log(candles);

    await saveCandlesToDb(candles.data, pool);
      
    console.log('Свечи успешно сохранены в базу данных!');
  } catch (error) {
    console.error('Ошибка при получении свечей:', (error as Error).message);
  } finally {
    await app.close();
  }
}

cron.schedule('* * * * *', () => {
  bootstrap()
});