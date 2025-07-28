import { Module } from '@nestjs/common';
import { MoexService } from './moex.service';

@Module({
  providers: [
    {
      provide: 'MoexService',
      useClass: MoexService,
    },
  ],
})
export class AppModule {} 