import { Injectable } from '@nestjs/common';
import axios from 'axios';

/**
 * Интерфейс для представления свечи (candle) с биржи MOEX
 */
export interface Candle {
  /** Цена открытия */
  open: number;
  /** Цена закрытия */
  close: number;
  /** Максимальная цена за период */
  high: number;
  /** Минимальная цена за период */
  low: number;
  /** Объем торгов в денежном выражении */
  value: number;
  /** Объем торгов в количестве лотов */
  volume: number;
  /** Время начала периода */
  begin: string;
  /** Время окончания периода */
  end: string;
}

/**
 * Сервис для работы с API Московской биржи (MOEX)
 * Предоставляет методы для получения данных о свечах
 */
@Injectable()
export class MoexService {
  /**
   * Базовый URL для API MOEX ISS
   * @private
   * @readonly
   */
  private readonly baseUrl = 'https://iss.moex.com/iss';

  /**
   * Получает свечи для указанной ценной бумаги за заданный период
   * @param security - Тикер ценной бумаги
   * @param from - Начальная дата периода
   * @param till - Конечная дата периода
   * @param interval - Интервал свечей в минутах
   * @returns Массив свечей
   * @throws {Error} При ошибке запроса к API MOEX
   */
  async getCandles(
    security: string,
    from: Date,
    till: Date,
    interval: number = 60
  ): Promise<Candle[]> {
    try {
      const fromStr = from.toISOString();
      const tillStr = till.toISOString();

      const url = `${this.baseUrl}/engines/${process.env.ENGINE}/markets/${process.env.MARKET}/securities/${process.env.SECURITY}/candles.json`;
      const params = {
        from: fromStr,
        till: tillStr,
        interval: interval.toString(),
      };

      console.log(`Запрос к MOEX ISS: ${url}`);
      console.log(`Период: ${fromStr} - ${tillStr}`);
      console.log(`Параметры:`, params);

      const response = await axios.get(url, { params });

      return response.data.candles;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Ошибка запроса к MOEX ISS: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  }
} 