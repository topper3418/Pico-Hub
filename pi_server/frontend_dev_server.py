from flask import Flask, render_template, request, jsonify
from py_lib.pico_interfaces import LedStrip
from py_lib.util import parse_color
from py_lib.logging_config import CustomLogger

# define the app
app = Flask(__name__)

# define the logger
logger = CustomLogger('dev_server')
logger.setLevel('DEBUG')

# define the global variables
color = "black"

# initialize the pico interface
led_strip = LedStrip("proto", "10.0.1.38")

@app.route("/")
def index():
  html_content = render_template("index.html", color=color)
  return html_content

@app.route('/handle_click', methods=['POST'])
def handle_click():
  global color
  global brightness
  data = request.json
  # print for debugging
  logger.debug(f'click handler received {data}')
  data_type = data['type']
  # process the data so that commands have an effect server-side
  print(f'data packet received: {data}')
  # create a response
  response = {'message': 'Click processed'}
  for key, value in data.items():
    response[key] = value
  # return the response
  return jsonify(str(response))

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5001, debug=False)
