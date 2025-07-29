import { Module } from '@nestjs/common';
import { MoexService } from './moex.service';

/**
 * Основной модуль приложения
 * Регистрирует провайдеры для работы с сервисами
 */
@Module({
  providers: [
    {
      provide: 'MoexService',
      useClass: MoexService,
    },
  ],
})
export class AppModule {} 