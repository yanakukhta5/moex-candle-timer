import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  value: number;
  volume: number;
  begin: string;
  end: string;
}

@Injectable()
export class MoexService {
  private readonly baseUrl = 'https://iss.moex.com/iss';

  async getCandles(
    security: string,
    from: Date,
    till: Date,
    interval: number = 60
  ): Promise<Candle[]> {
    try {
      const fromStr = from.toISOString();
      const tillStr = till.toISOString();

      const url = `${this.baseUrl}/engines/stock/markets/shares/securities/${security}/candles.json`;
      const params = {
        from: fromStr,
        till: tillStr,
        interval: interval.toString(),
      };

      console.log(`Запрос к MOEX ISS: ${url}`);
      console.log(`Период: ${fromStr} - ${tillStr}`);
      console.log(`Параметры:`, params);

      const response = await axios.get(url, { params });

      console.log('Полученные данные: ', response.data);

      return response.data;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Ошибка запроса к MOEX ISS: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  }
} 