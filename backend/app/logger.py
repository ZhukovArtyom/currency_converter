import sys
import os
from datetime import datetime
from loguru import logger

# Удаляем стандартный обработчик
logger.remove()

# Формат для вывода в консоль (цветной, читаемый)
CONSOLE_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<level>{message}</level>"
)

# Формат для файлов (JSON, для анализа)
JSON_FORMAT = (
    '{{'
    '"time": "{time:YYYY-MM-DD HH:mm:ss.SSS}", '
    '"level": "{level}", '
    '"name": "{name}", '
    '"function": "{function}", '
    '"line": {line}, '
    '"message": "{message}", '
    '"extra": {extra}'
    '}}'
)


def setup_logging(
        log_level: str = "DEBUG",
        log_to_file: bool = True,
        log_to_console: bool = True,
        json_format: bool = False
):
    """
    Настройка логирования

    Args:
        log_level: Уровень логирования (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Писать ли в файл
        log_to_console: Писать ли в консоль
        json_format: Использовать ли JSON формат для файлов
    """

    # Консольный вывод
    if log_to_console:
        logger.add(
            sys.stdout,
            format=CONSOLE_FORMAT,
            level=log_level,
            colorize=True,
            backtrace=True,
            diagnose=True
        )

    # Файловый вывод
    if log_to_file:
        # Создаем папку для логов, если её нет
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        # Ежедневная ротация логов
        log_file = f"{log_dir}/currency_converter_{{time:YYYY-MM-DD}}.log"

        if json_format:
            logger.add(
                log_file,
                format=JSON_FORMAT,
                level=log_level,
                rotation="00:00",  # Ротация в полночь
                retention="30 days",  # Храним 30 дней
                compression="gz",  # Сжимаем старые логи
                encoding="utf-8"
            )
        else:
            logger.add(
                log_file,
                format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
                level=log_level,
                rotation="00:00",
                retention="30 days",
                compression="gz",
                encoding="utf-8"
            )

    logger.info(f"✅ Логирование настроено: уровень={log_level}, файл={log_to_file}, JSON={json_format}")
    return logger


# Создаем экземпляр логгера для использования в проекте
log = logger

# Экспортируем функцию настройки
__all__ = ["setup_logging", "log"]