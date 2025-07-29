import * as sql from 'mssql';

/**
 * Конфигурация подключения к базе данных MSSQL
 * @type {sql.config}
 */
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

/**
 * Сохраняет свечи в базу данных через хранимую процедуру
 * @param candles - Массив свечей для сохранения
 * @param pool - Пул соединений с базой данных
 * @throws {Error} При ошибке сохранения данных
 */
export const saveCandlesToDb = async (candles: string[][], pool: sql.ConnectionPool) => {
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
        new Date(candle.at(-1) || ''), // begin
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

    await request.execute('sp_SaveCandlesBatch');
  } catch (error) {
    console.error('Ошибка при сохранении свечей в БД:', error);
    throw error;
  }
}

/**
 * Устанавливает соединение с базой данных MSSQL
 * @returns Пул соединений с базой данных
 * @throws {Error} При ошибке подключения к базе данных
 */
export const connectToDb = async (): Promise<sql.ConnectionPool> => {
  try {
    const pool = await sql.connect(config);
    console.log('Успешное подключение к MSSQL!');
    return pool;
  } catch (err) {
    console.error('Ошибка подключения к БД:', err);
    throw err;
  }
}