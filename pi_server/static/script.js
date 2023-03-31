class LedStripObject {
    constructor() {
      this.color = 'rgb(255,0,0)';
      this.hueColor = 'rgb(255,255,255)';
      this.brightness = 255;
      this.hueMode = false;
    }
    setColor(newColor) {
      if (this.hueMode) {
        this.hueColor = newColor;
      } else {
        this.color = newColor;
      }
    }
    setBrightness(newBrightness) {
      this.brightness = newBrightness;
    }
    toggleMode() {
      this.hueMode = !this.hueMode;
    }
  };
  


// initialize element variables
var colorpicker_container = document.getElementById('colorpicker-container');
var brightpicker_container = document.getElementById('brightpicker-container');
var button_container = document.getElementById('button-container');
var colorpicker_canvas = document.getElementById('colorpicker');
var brightpicker = document.getElementById('brightpicker');
var toggle_button = document.getElementById('toggle-button');
var mode_button = document.getElementById('color-button');
// initialize gloabal variables
const led_strip = new LedStripObject();
led_strip.hueMode = 'color';
var status = 'off';
// initialize the image in memory
var imageUrl = colorpicker_canvas.getAttribute('data-src');
var img = new Image();
img.src = imageUrl;
// calculate sizes
width = colorpicker_canvas.clientWidth;
colorpicker_height = width + 'px';
brightpicker_height = width/4 + 'px';
button_height = width/8 + 'px';
color_button_width = width/8 + 'px';
// apply sizes
colorpicker_canvas.style.height = colorpicker_height;
brightpicker.style.height = brightpicker_height;
toggle_button.style.height = button_height;
mode_button.style.height = button_height;
mode_button.style.width = color_button_width;

// functions
function handleClickRequest(data) {
    console.log('Sending fetch request with data: ', data);
    // Perform fetch request to server
    fetch('/handle_click', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Response from server:', response);
        })
        .catch(error => {
            console.log('Error:', error);
        });
};
function redrawColorPicker() {
    // depending on the mode, draw the color picker with the image
    var ctx;
    if (led_strip.hueMode) {
        ctx = drawHuePicker();
    } else {
        ctx = drawColorPicker();
    };
    // return the context to extract the pixel data if needed
    return ctx;
};
function drawColorPicker() {
    // Draw the image on the canvas
    const ctx = colorpicker_canvas.getContext('2d');
    ctx.clearRect(0, 0, colorpicker_canvas.width, colorpicker_canvas.height);
    ctx.drawImage(img, 0, 0, colorpicker_canvas.width, colorpicker_canvas.height);
    // return the context to extract the pixel data if needed
    return ctx;
};
function drawHuePicker() {
    // Get the 2D context of the canvas
    const ctx = colorpicker_canvas.getContext('2d');

    // Calculate the center and radius of the canvas
    const centerX = colorpicker_canvas.width / 2;
    const centerY = colorpicker_canvas.height / 2;
    const radius = Math.sqrt(centerX * centerX + centerY * centerY);

    // Create a radial gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

    // Define the gradient colors
    gradient.addColorStop(0, 'orange');
    gradient.addColorStop(0.5, 'white');
    gradient.addColorStop(1, 'blue');

    // Draw the gradient on the canvas
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, colorpicker_canvas.width, colorpicker_canvas.height);
    // return the context to extract the pixel data, if needed
    return ctx
};
function redrawBrightPicker() {
    let [r, g, b] = parseColor(led_strip.color);
    // create a gradient on the brightness canvas
    var ctx = brightpicker.getContext('2d');
    ctx.clearRect(0, 0, brightpicker.width, brightpicker.height);
    var grd = ctx.createLinearGradient(0, 0, brightpicker.width, 0);
    grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    grd.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',1)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, brightpicker.width, brightpicker.height);
    // return the context to extract the pixel data, if needed
    return ctx;
};
function toggleMode() {
    // set the mode, and set the color of the color button
    led_strip.toggleMode();
    if (led_strip.hueMode) {
        mode_button.style.backgroundColor = led_strip.color;
    } else {
        mode_button.style.backgroundColor = led_strip.hueColor;
    };
    // log to the console
    console.log('mode set to: ', led_strip.hueMode);
    // redraw the color picker
    redrawColorPicker();
};
function setColor(r, g, b) {
    // set the color, and redraw the brightness canvas
    led_strip.color = 'rgb(' + r + ',' + g + ',' + b + ')';
    redrawBrightPicker();
    // log to the console
    console.log('color set to: ', led_strip.color);
};
function setBrightness(b) {
    // set the brightness, and set the opacity of the color canvas
    led_strip.brightness = b;
    colorpicker_canvas.style.opacity = led_strip.brightness/255;
    // log to the console
    console.log('brightness set to: ', led_strip.brightness);
};
function parseColor(color_in) {
    // function to parse color to r g and b
    var rgb = color_in.substring(4, color_in.length - 1).split(",");
    var r = rgb[0].trim();
    var g = rgb[1].trim();
    var b = rgb[2].trim();
    return [r, g, b];
};

// event listeners
img.onload = function() {
    // Redraw the canvas for the first time
    redrawColorPicker();
    // Redraw the brightness canvas for the first time
    redrawBrightPicker();
};
colorpicker_canvas.addEventListener('click', function (event) {
    // Add event listener for clicks on the canvas

    // Redraw the canvas with the new click coordinates
    ctx = redrawColorPicker();

    // adjust the click coordinates to match the image
    var x = event.offsetX * (colorpicker_canvas.width / colorpicker_canvas.clientWidth);
    var y = event.offsetY * (colorpicker_canvas.height / colorpicker_canvas.clientHeight);

    // Get the pixel data for the clicked coordinate
    var pixelData = ctx.getImageData(x, y, 1, 1).data;

    // set the color accordingly
    setColor(pixelData[0], pixelData[1], pixelData[2]);

    // Verbose deubgging
    console.log("color click detected. coords: (" + event.offsetX + ", " + event.offsetY + "), color: " + pixelData);

    // Call the Ajax request function with the data
    var data = {
        'type': 'image_click',
        'x': event.offsetX,
        'y': event.offsetY,
        'color': led_strip.color
    };
    handleClickRequest(data);
});
brightpicker.addEventListener('click', function (event) {
    // Redraw the brightness canvas with the new click coordinates
    ctx = redrawBrightPicker();

    // adjust the click coordinates to match the image
    var x = event.offsetX * (brightpicker.width / brightpicker.clientWidth);
    var y = event.offsetY * (brightpicker.height / brightpicker.clientHeight);

    // Get the pixel data for the clicked coordinate
    var pixelData = ctx.getImageData(x, y, 1, 1).data;

    // Convert the pixel data to RGB format
    var b = pixelData[3];

    // set the brightness accordingly
    setBrightness(b);

    // Verbose deubgging
    console.log("brightness click detected. coords: (" + event.offsetX + ", " + event.offsetY + "), brightness: " + b);

    // Call the Ajax request function with the data
    var data = {
        'type': 'brightness_click',
        'x': event.offsetX,
        'y': event.offsetY,
        'brightness': b
    };
    handleClickRequest(data);
});
toggle_button.addEventListener('click', function (event) {
    // Add event listener for clicks on the toggle button

    // log the click
    console.log("toggle click detected");
    // Call the Ajax request function with the data
    var data = {
        'type': 'toggle_click'
    };
    handleClickRequest(data);
});
mode_button.addEventListener('click', function (event) {
    // change the mode
    toggleMode();
    // log the click
    console.log("mode click detected");
    // Call the Ajax request function with the data
    var data = {
        'type': 'mode_click',
        'color': mode_button.style.backgroundColor
    };
    handleClickRequest(data);
});


// lets reason this out: 
    // Kwhen the image is clicked, the color changes. 
    // Kwhen the color is changed, we need to update the brightness canvas and the toggle button
    // Kwhen the brightness is changed, we need to update the color canvas
    // when the status is off, the toggle button should be slightly brighter than when it is on
    // when the status is on, the toggle button should be slightly darker than when it is off
    // when the white button is clicked, the color does not change, but the color button should change to the current color
    // when the white button is clicked, the color canvas should change to a hue canvas
    // I'll need to switch to a bunch of <a> tags to link images to the canvas
