# moex-candle-timer

Консольное приложение на NestJS, которое по расписанию "каждый день в 6:00 утра" скачивает с MOEX ISS почасовые свечи за предыдущий день и сохраняет в БД MSSQL.

## Запуск приложения

- docker-compose up -d

## Остановка приложения

- docker-compose down -v

## Дополнительные команды

- docker-compose up -d --build app
(Пересобрать контейнер nest.js приложения)

- docker-compose stop app
(Остановить контейнер node.js)

- docker-compose exec mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStr0ngP@ssword" -d "moex-candle" -No -Q "SELECT * FROM candles;"
(Проверка заполненности ДБ)

## features

- описание источника данных: https://iss.moex.com/iss/reference/341 ;
- параметры engine, market и security передаются в приложение через переменные среды;
- параметр interval считается константой, равной 60;
- в таблице сохраняются security (параметр запроса), begin, open, close, high, low и volume (из ответа метода);
- в качестве уникального ключа используется security+begin;
- для сохранения в БД используется хранимая процедура, принимающая таблицу (батч);
- учтена вероятность получения дубликатов по ключу security+begin (задействован MERGE при сохранении в БД);
- используется TypeScript;
- все константы, функции/методы и их параметры прокомментированы в нотации JSDoc на русском языке.

## Пример вызова

GET https://iss.moex.com/iss/engines/stock/markets/shares/securities/ROSN/candles?from=2025-07-24%2000:00:00&till=2025-07-24%2023:00:00&interval=60
