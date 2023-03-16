"""this file will define objects that represent raspberry pi picos and will allow for easy communication with them"""
import requests, logging
from py_lib.logging_config import CustomLogger
from py_lib.util import get_trace

logger = CustomLogger(__name__)
logger.setLevel('DEBUG')


class LedStrip:
    """this class will define a led strip and will allow for easy communication with it"""
    
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip
        self._status = "off"
        self._color = (0, 0, 0)
        self._brightness = 0
        
    @property
    def status(self):
        return self._status
    
    @status.setter
    def status(self, value):
        self._status = value
        print('status changed, sending request')
        response = self.send_status_request()
        logger.info(f'status set to {value} with return code: {response.status_code}')
        
    @property
    def color(self):
        return self._color
    
    @color.setter
    def color(self, value):
        self._color = value
        logger.debug(f'color changed to {value}, sending request')
        response = self.send_color_request()
        logger.info(f'color set to {value} with return code: {response.status_code}')
        
    @property
    def brightness(self):
        return self._brightness
    
    @brightness.setter
    def brightness(self, value):
        self._brightness = value
        logger.debug(f'brightness changed to {value}, sending request')
        response = self.send_brightness_request()
        logger.info(f'bightness set to {value} with return code: {response.status_code}')

    def send_test_request(self):
        """this method will send a test request to the pico"""
        response = requests.get(f"http://{self.ip}/test")
        logger.debug(f'response from test request: {response}')
        return response
    
    def send_color_request(self):
        """this method will send a color request to the pico"""
        color = f"{self.color[0]},{self.color[1]},{self.color[2]}"
        response = requests.get(f"http://{self.ip}/color?color={color}")
        logger.debug(f'response from color request: {response}')
        return response
        
    def send_brightness_request(self):
        """this method will send a brightness request to the pico"""
        response = requests.get(f"http://{self.ip}/brightness?brightness={self.brightness}")
        logger.debug(f'response from brightness request: {response}')
        return response
        
    def send_status_request(self):
        """this method will send a status request to the pico"""
        response = requests.get(f"http://{self.ip}/status?status={self.status}")
        logger.debug(f'response from status request: {response}')
        return response
        
        
if __name__ == "__main__":
    pass