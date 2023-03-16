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
last_command = '/lightoff?'

# gpio variables
knob = ADC(28)
strip = neopixel.NeoPixel(Pin(4), 30)
leds = list(range(29))
brightness = 0
needs_to_print = False


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

def old_webpage(state):
    html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            body {{
                display: flex;
                flex-direction: column;
                width: 100vh;
                height: 100vh;
            }}
            form {{
                width: 50%;
                height:33%;
            }}
            canvas {{
                width: 50%;
                height: 33%;
            }}
            input[type="submit"] {{
                width: 100%;
                height: 100%;
                font-size: 5rem;
            }}
            input[type="color"] {{
                width: 100%;
                height: 100%;
                font-size: 5rem;
            }}
            input[type="submit"].True {{
                background-color: lightgreen;
            }}
            input[type="submit"].False {{
                background-color: darkgreen;
            }}
            </style>
        </head>
        <body>
            <form>
                <input type="color" name="color"/>
                <a href="./toggle?colorValue={ request.args.get('color') }" class="{'True' if state=='on' else 'False'}">
                    Light off
                </a>
            </form>
        </body>
        </html>
    """

    return html


def webpage(state, color=''):
    html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            body {{
                display: flex;
                flex-direction: column;
                width: 100vh;
                height: 100vh;
            }}
            form {{
                width: 50%;
                height:33%;
            }}
            canvas {{
                width: 50%;
                height: 33%;
            }}
            input[type="submit"] {{
                width: 100%;
                height: 100%;
                font-size: 5rem;
            }}
            input[type="color"] {{
                width: 100%;
                height: 100%;
                font-size: 5rem;
            }}
            input[type="submit"].True {{
                background-color: lightgreen;
            }}
            input[type="submit"].False {{
                background-color: darkgreen;
            }}
            </style>
        </head>
        <body>
            <form>
                <input type="color" name="color"/>
                <a href="./toggle?colorValue={color}" class="{'True' if state=='on' else 'False'}">
                    Light off
                </a>
            </form>
        </body>
        </html>
    """

    return html

        
def read_knob():
    """sets the global brightness"""
    global brightness
    global needs_to_print
    minimum = 30000
    maximum = 65535
    # get local inputs
    knob_value = knob.read_u16()
    if knob_value <= minimum:
        brightness = 0
    elif knob_value >= maximum:
        brightness = 255
    else:
        shifted_max = maximum - minimum
        shifted_value = knob_value - minimum
        percentage = shifted_value/shifted_max
        brightness = int(255 * percentage)
            
def write_to_leds():
    """takes the brightness command and the last html command and does LED stuff"""
    global strip
    if last_command == '/lightoff?':
        light_value = 0
    elif last_command == '/lighton?':
        light_value = brightness
    # write the values to the LEDs
    for led in leds:
        strip[led] = (light_value, 0, 0)
    strip.write()

sLock = _thread.allocate_lock()

def old_serve():
    """serves the connection for the webpage"""
    ip = connect()
    connection = open_socket(ip)
    state = ''
    while True:
        # get connection/request
        client = connection.accept()[0]
        request = client.recv(1024)
        request = str(request)
        print(request)
        sLock.acquire()
        global brightness
        global last_command
        global needs_to_print
        # get html inputs
        try:
            cmd = request.split()[1]
        except IndexError:
            cmd = ''
            pass
        if cmd == '/lighton?':
            last_command = cmd
            state = 'on'
            needs_to_print = True
        elif cmd == '/lightoff?':
            last_command = cmd
            state = 'off'
            needs_to_print = False
        sLock.release()
        html = webpage(state)
        client.send(html)
        client.close()
        

def serve():
    """serves the connection for the webpage"""
    ip = connect()
    connection = open_socket(ip)
    state = ''
    while True:
        # get connection/request
        client = connection.accept()[0]
        request = client.recv(1024)
        request = str(request)
        print(request)
        sLock.acquire()
        global brightness
        global last_command
        global needs_to_print
        # get html inputs
        try:
            cmd, params = request.split('?')
            param = params.split('&')[0]
        except (IndexError, ValueError):
            cmd = ''
            param = ''
        if cmd == '/lighton':
            last_command = cmd
            state = 'on'
            needs_to_print = True
        elif cmd == '/lightoff':
            last_command = cmd
            state = 'off'
            needs_to_print = False
        elif cmd == '/toggle':
            last_command = cmd + '?' + param
            state = 'on' if state == 'off' else 'off'
            needs_to_print = True
        sLock.release()
        html = webpage(state)
        client.send(html)
        client.close()


def run_gpio():
    while True:
        sLock.acquire()
        read_knob()
        write_to_leds()
        sLock.release()

try:
    _thread.start_new_thread(run_gpio, ())
    serve()
except KeyboardInterrupt:
    machine.reset()

