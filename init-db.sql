CREATE DATABASE [moex-candle];
GO

USE [moex-candle];
GO

CREATE TABLE [dbo].[candles] (
    [security] VARCHAR(50) NOT NULL,
    [begin] DATETIME NOT NULL,
    [open] FLOAT NOT NULL,
    [close] FLOAT NOT NULL,
    [high] FLOAT NOT NULL,
    [low] FLOAT NOT NULL,
    [volume] FLOAT NOT NULL,
    CONSTRAINT [PK_candles_security_begin] PRIMARY KEY ([security], [begin])
);
GO

-- Создание пользовательского типа таблицы для передачи данных
CREATE TYPE [dbo].[CandleTableType] AS TABLE (
    [security] VARCHAR(50) NOT NULL,
    [begin] DATETIME NOT NULL,
    [open] FLOAT NOT NULL,
    [close] FLOAT NOT NULL,
    [high] FLOAT NOT NULL,
    [low] FLOAT NOT NULL,
    [volume] FLOAT NOT NULL
);
GO

-- Хранимая процедура для батчевого сохранения свечей
CREATE PROCEDURE [dbo].[sp_SaveCandlesBatch]
    @CandlesData [dbo].[CandleTableType] READONLY
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Вставка данных с обработкой дубликатов (UPSERT)
        MERGE [dbo].[candles] AS target
        USING @CandlesData AS source
        ON (target.[security] = source.[security] AND target.[begin] = source.[begin])
        WHEN MATCHED THEN
            UPDATE SET
                target.[open] = source.[open],
                target.[close] = source.[close],
                target.[high] = source.[high],
                target.[low] = source.[low],
                target.[volume] = source.[volume]
        WHEN NOT MATCHED THEN
            INSERT ([security], [begin], [open], [close], [high], [low], [volume])
            VALUES (source.[security], source.[begin], source.[open], source.[close], source.[high], source.[low], source.[volume]);
        
        COMMIT TRANSACTION;
        
        -- Возвращаем количество обработанных записей
        SELECT @@ROWCOUNT AS RowsAffected;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Возвращаем информацию об ошибке
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_MESSAGE() AS ErrorMessage,
            ERROR_LINE() AS ErrorLine;
    END CATCH
END;
GO

