import logging
import datetime


class CustomLogger(logging.Logger):
    """This class will extend the logging.Logger class to add a custom log method"""
    
    def __init__(self, name, level=logging.NOTSET):
        super().__init__(name, level)
        self.addHandler(self._get_default_handler())
            
    def _get_default_handler(self):
        """This method will return a default StreamHandler with a custom formatter"""
        handler = logging.FileHandler(f'log_{datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}.log')
        formatter = logging.Formatter('%(asctime)s %(levelname)s [%(name)s] %(message)s')
        handler.setFormatter(formatter)
        return handler