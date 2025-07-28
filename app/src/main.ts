import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Получаем сервис для работы с MOEX
  const moexService = app.get('MoexService');
  
  try {
    // Получаем свечи за текущий день
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const till = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const candles = await moexService.getCandles('ROSN', from, till);
    
  } catch (error) {
    console.error('Ошибка при получении свечей:', (error as Error).message);
  } finally {
    await app.close();
  }
}

bootstrap(); 