import cron from 'node-cron'; 
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { connectToDb, saveCandlesToDb } from './db';

/**
 * Основная функция приложения, которая запускает процесс получения и сохранения свечей
 */
const bootstrap = async (): Promise<void> => {
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
  
    await saveCandlesToDb(candles.data, pool);
  
    console.log(candles);
    console.log('Свечи успешно сохранены в базу данных!');
  } catch (error) {
    console.error('Ошибка при получении свечей:', (error as Error).message);
  } finally {
    await app.close();
  }
};

/**
 * Планировщик задач, запускающий основную функцию каждую минуту
 */
cron.schedule('* * * * *', () => {
  bootstrap()
});