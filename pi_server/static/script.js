// initialize element variables
var colorpicker_container = document.getElementById('colorpicker-container');
var brightpicker_container = document.getElementById('brightpicker-container');
var button_container = document.getElementById('button-container');
var colorpicker = document.getElementById('colorpicker');
var brightpicker = document.getElementById('brightpicker');
var toggle_button = document.getElementById('toggle-button');
var mode_button = document.getElementById('color-button');
// initialize gloabal variables
var whitecolor = 'rgb(255,255,255)';
var color = 'rgb(255,0,0)';
var brightness = 255;
var mode = 'color';
var status = 'off';
// initialize the image in memory
var imageUrl = colorpicker.getAttribute('data-src');
var img = new Image();
img.src = imageUrl;
// calculate sizes
width = colorpicker.clientWidth;
colorpicker_height = width + 'px';
brightpicker_height = width/4 + 'px';
button_height = width/8 + 'px';
color_button_width = width/8 + 'px';
// apply sizes
colorpicker.style.height = colorpicker_height;
brightpicker.style.height = brightpicker_height;
toggle_button.style.height = button_height;
mode_button.style.height = button_height;
mode_button.style.width = color_button_width;

// functions
function handleClickRequest(data) {
    console.log('Sending fetch request sent with data: ', data);
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
function redrawColorCanvas() {
    // Redraw the canvas with the new click coordinates, will read frequently
    var ctx = colorpicker.getContext('2d');
    ctx.clearRect(0, 0, colorpicker.width, colorpicker.height);
    ctx.drawImage(img, 0, 0, colorpicker.width, colorpicker.height);
    // return the context to extract the pixel data if needed
    return ctx;
};
function redraw_brightpicker() {
    let [r, g, b] = parseColor(color);
    // create a gradient on the brightness canvas
    var ctx = brightpicker.getContext('2d');
    var grd = ctx.createLinearGradient(0, 0, brightpicker.width, 0);
    grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    grd.addColorStop(1, color);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, brightpicker.width, brightpicker.height);
    // return the context to extract the pixel data, if needed
    return ctx;
};
function setMode(m) {
    // set the mode, and set the color of the color button
    mode = m;
    if (mode == 'white') {
        mode_button.style.backgroundColor = color;
    } else if (mode == 'color') {
        mode_button.style.backgroundColor = whitecolor;
    };
    // log to the console
    console.log('mode set to: ', mode);
};
function setColor(r, g, b) {
    // set the color, and redraw the brightness canvas
    color = 'rgb(' + r + ',' + g + ',' + b + ')';
    redraw_brightpicker();
    // log to the console
    console.log('color set to: ', color);
};
function setBrightness(b) {
    // set the brightness, and set the opacity of the color canvas
    brightness = b;
    colorpicker.style.opacity = brightness/255;
    // log to the console
    console.log('brightness set to: ', brightness);
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
    redrawColorCanvas();
    // Redraw the brightness canvas for the first time
    redraw_brightpicker();
    // set the mode to the curernt mode
    setMode(mode);
};
colorpicker.addEventListener('click', function (event) {
    // Add event listener for clicks on the canvas

    // Redraw the canvas with the new click coordinates
    ctx = redrawColorCanvas();

    // adjust the click coordinates to match the image
    var x = event.offsetX * (colorpicker.width / colorpicker.clientWidth);
    var y = event.offsetY * (colorpicker.height / colorpicker.clientHeight);

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
        'color': color
    };
    handleClickRequest(data);
});
brightpicker.addEventListener('click', function (event) {
    // Redraw the brightness canvas with the new click coordinates
    ctx = redraw_brightpicker();

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
    if (mode == 'white') {
        setMode('color');
    } else if (mode == 'color') {
        setMode('white');
    };
    // log the click
    console.log("white click detected");
    // Call the Ajax request function with the data
    var data = {
        'type': 'mode_click',
        'color': mode_button.style.backgroundColor
    };
    // set the color to white
    col = parseColor(mode_button.style.backgroundColor);
    setColor(col[0], col[1], col[2]);
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
