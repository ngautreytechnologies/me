import logging
from logging import StreamHandler, FileHandler
from typing import Optional

class LoggerBuilder:
    def __init__(self):
        self.level = logging.INFO
        self.console_enabled = False
        self.file_path: Optional[str] = None

    def with_level(self, level: str):
        self.level = getattr(logging, level.upper(), logging.INFO)
        return self

    def with_console_output(self):
        self.console_enabled = True
        return self

    def with_file_output(self, file_path: str = "dendriflow.log"):
        self.file_path = file_path
        return self

    def with_file_output_if(self, condition: bool, file_path: str = "dendriflow.log"):
        if condition:
            self.with_file_output(file_path)
        return self

    def build(self, name="dendriflow"):
        logger = logging.getLogger(name)
        logger.setLevel(self.level)
        logger.handlers = []  # Reset any previous handlers

        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s: %(message)s", "%Y-%m-%d %H:%M:%S"
        )

        if self.console_enabled:
            console_handler = StreamHandler()
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)

        if self.file_path:
            file_handler = FileHandler(self.file_path)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

        return logger
