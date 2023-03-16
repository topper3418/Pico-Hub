from machine import ADC, Pin
from time import sleep
import neopixel
import network
import socket
import _thread


# networking variables
ssid = 'the house with shitty wifi'
password = 'SlutDragon67'
led = Pin('LED', Pin.OUT)

# gpio variables
knob = ADC(28)
strip = neopixel.NeoPixel(Pin(4), 30)
leds = list(range(29))
knob_brightness = 0
network_brightness = 0
color = (0, 0, 0)
status = 'off'
# variables for controlling the brightness
brightness_override = False
knob_value_at_override = 0


def connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while wlan.isconnected() == False:
        print('Waiting for connection...')
        sleep(1)
    ip = wlan.ifconfig()[0]
    print(f'Connected on {ip}')
    return ip

def open_socket(ip):
    address = (ip, 80)
    connection = socket.socket()
    connection.bind(address)
    connection.listen(1)
    return connection

def read_knob():
    """sets the global brightness"""
    global knob_brightness
    global brightness_override
    minimum = 30000
    maximum = 65535
    # get local inputs
    knob_value = knob.read_u16()
    if knob_value <= minimum:
        knob_brightness = 0
    elif knob_value >= maximum:
        knob_brightness = 255
    else:
        shifted_max = maximum - minimum
        shifted_value = knob_value - minimum
        percentage = shifted_value/shifted_max
        knob_brightness = int(255 * percentage)
    # check if the brightness override should be turned off
    if abs(knob_brightness - knob_value_at_override) > 25:
        brightness_override = False
            
def write_to_leds():
    """takes the brightness command and the last html command and does LED stuff"""
    global strip
    # choose brightness value based on the brightness override value
    if brightness_override:
        brightness = network_brightness
    else:
        brightness = knob_brightness
    if status == 'off':
        brightness = 0
    # write the value to the LEDs
    for led in leds:
        strip[led] = tuple(int(color_value*(brightness/255)) for color_value in color)
    strip.write()


sLock = _thread.allocate_lock()
def handle_request(request):
    # parse the request to get the value
    data = request.split(' ')[1]
    param = data.split('=')[-1]
    # set the global variables based on the request type
    if 'color?color' in request:
        red, green, blue = [int(value) for value in param.split(',')]
        global color
        sLock.acquire()
        color = (red, green, blue)
        sLock.release()
        return b'color set'
    if 'brightness?brightness' in request:
        brightness_in = int(param)
        global brightness_override
        global knob_value_at_override
        global network_brightness
        sLock.acquire()
        brightness_override = True
        knob_value_at_override = knob_brightness
        network_brightness = brightness_in
        sLock.release()
        return b'brightness set'
    if 'status?status' in request:
        global status
        sLock.acquire()
        status = param
        sLock.release()
        return b'status set'

def client():
    """serves the connection for the webpage"""
    ip = connect()
    connection = open_socket(ip)
    state = ''
    while True:
        # get connection/request
        server = connection.accept()[0]
        request = server.recv(1024)
        request = str(request)
        print(request)
        response_body = handle_request(request)
        response_headers = [
            b'HTTP/1.1 200 OK',
            b'Content-Type: text/plain',
            b'Content-Length: ' + str(len(response_body)).encode(),
            b'Connection: close',
            b'\r\n'
        ]
        # send the HTTP response
        response = b'\r\n'.join(response_headers) + response_body
        server.sendall(response)
        # close the client socket
        server.close()


def run_gpio():
    while True:
        sLock.acquire()
        read_knob()
        write_to_leds()
        sLock.release()

try:
    _thread.start_new_thread(run_gpio, ())
    client()
except KeyboardInterrupt:
    machine.reset()

