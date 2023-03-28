// Create a new image element

// initialize element variables
var colorpicker_container = document.getElementById('colorpicker-container');
var brightpicker_container = document.getElementById('brightpicker-container');
var button_container = document.getElementById('button-container');
var colorpicker = document.getElementById('colorpicker');
var brightpicker = document.getElementById('brightpicker');
var toggle_button = document.getElementById('toggle-button');
var color_button = document.getElementById('color-button');
// initialize gloabal variables
var color = 'rgba(255,255,255, 0)';
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
color_button.style.height = button_height;
color_button.style.width = color_button_width;



//color_button.style.backgroundColor = 'rgb(255,255,255)';
// Get the bottom row so we can make it the right height as well
//var bottom_row = document.querySelector('.bottom-row');
// set the colorpicker canvas to square
//colorGrid.height = colorGrid.width;
// global variable to hold the color
//var color = 'rgb(255,255,255)';

// Function to handle Ajax request
function handleClickRequest(data) {
    // Log to the console
    console.log('Ajax request sent with data: ', data);
    // Perform Ajax request here
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
}
// function to redraw the color canvas
function redrawColorCanvas() {
    // Redraw the canvas with the new click coordinates, will read frequently
    var ctx = colorpicker.getContext('2d');
    ctx.clearRect(0, 0, colorpicker.width, colorpicker.height);
    ctx.drawImage(img, 0, 0, colorpicker.width, colorpicker.height);

    // log to the console
    console.log('color canvas redrawn');
    // return the context to extract the pixel data if needed
    return ctx;
}
// function to redraw the brightness canvas
function redrawBrightnessCanvas() {
    // Set the brightness canvas height to match the image height
    brightpicker.height = colorpicker.clientHeight/8;

    // parse color
    var rgb = color.substring(4, color.length - 1).split(",");
    var r = rgb[0].trim();
    var g = rgb[1].trim();
    var b = rgb[2].trim();

    // create a gradient on the brightness canvas
    var ctx = brightpicker.getContext('2d');
    var grd = ctx.createLinearGradient(0, 0, brightpicker.width, 0);
    grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    grd.addColorStop(1, color);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, brightpicker.width, brightpicker.height);
    // log to the console
    console.log('brightness canvas redrawn to: ', color);
    // return the context to extract the pixel data
    return ctx;
}
// function to re draw the bottom row
function redrawBottomRow() {
    // Log to the console to show that the function was called
    console.log('redrawing bottom row');
    // Set the bottom row height to match the image height
    bottom_row.style.height = colorGrid.clientHeight/4 + 'px';
    computed_style = getComputedStyle(bottom_row);
    // Set the white button to square
    var height = white_button.clientHeight;
    // get the padding on the button
    var padding = parseInt(computed_style.paddingTop) + parseInt(computed_style.paddingBottom);
    white_button.style.width = height + padding + 'px';
    var computed_style = getComputedStyle(white_button);
};

// function to set the color
function setColor(r, g, b) {
    // if the current color is white, set the white button back to white
    if (color == 'rgb(255,255,255)') {
        white_button.style.backgroundColor = color;
    };
    // if the new color is white, set the white button to the current color
    if (r == 255 && g == 255 && b == 255) {
        white_button.style.backgroundColor = color;
    };
    // set the color, and redraw the brightness canvas
    color = 'rgb(' + r + ',' + g + ',' + b + ')';
    redrawBrightnessCanvas();
    // log to the console
    console.log('color set to: ', color);
};

// function to parse color to r g and b
function parseColor(color) {
    var rgb = color.substring(4, color.length - 1).split(",");
    var r = rgb[0].trim();
    var g = rgb[1].trim();
    var b = rgb[2].trim();
    return [r, g, b];
};

// Add onload event listener to the image
img.onload = function() {
    // Redraw the canvas for the first time
    redrawColorCanvas();
    // Redraw the brightness canvas for the first time
    redrawBrightnessCanvas();
    // Redraw the bottom row for the first time
    // redrawBottomRow();
};

// Add event listener for clicks on the canvas
colorpicker.addEventListener('click', function (event) {
    // Redraw the canvas with the new click coordinates
    ctx = redrawColorCanvas();

    // adjust the click coordinates to match the image
    var x = event.offsetX * (colorpicker.width / colorpicker.clientWidth);
    var y = event.offsetY * (colorpicker.height / colorpicker.clientHeight);

    // Get the pixel data for the clicked coordinate
    var pixelData = ctx.getImageData(x, y, 1, 1).data;

    // set the color accordingly
    //setColor(pixelData[0], pixelData[1], pixelData[2]);

    // Verbose deubgging
    console.log("color click detected. coords: (" + event.offsetX + ", " + event.offsetY + "), color: " + pixelData);

    // Call the Ajax request function with the data
    var data = {
        'type': 'image_click',
        'x': event.offsetX,
        'y': event.offsetY,
        'color': color
    };
    //handleClickRequest(data);
});

// Add event listener for clicks on the brightness canvas
brightpicker.addEventListener('click', function (event) {
    // Redraw the brightness canvas with the new click coordinates
    ctx = redrawBrightnessCanvas(color);

    // adjust the click coordinates to match the image
    var x = event.offsetX * (brightpicker.width / brightpicker.clientWidth);
    var y = event.offsetY * (brightpicker.height / brightpicker.clientHeight);

    // Get the pixel data for the clicked coordinate
    var pixelData = ctx.getImageData(x, y, 1, 1).data;

    // Convert the pixel data to RGB format
    var brightness = pixelData[3];

    // Verbose deubgging
    console.log("color click detected. coords: (" + event.offsetX + ", " + event.offsetY + "), brightness: " + brightness);

    // Call the Ajax request function with the data
    var data = {
        'type': 'brightness_click',
        'x': event.offsetX,
        'y': event.offsetY,
        'brightness': brightness
    };
    handleClickRequest(data);
});

// Add event listener for clicks on the toggle button
toggle_button.addEventListener('click', function (event) {
    // log the click
    console.log("toggle click detected");
    // Call the Ajax request function with the data
    var data = {
        'type': 'toggle_click'
    };
    handleClickRequest(data);
});

// Add event listener for clicks on the white button
color_button.addEventListener('click', function (event) {
    // log the click
    console.log("white click detected");
    // Call the Ajax request function with the data
    var data = {
        'type': 'memory_click',
        'color': white_button.style.backgroundColor
    };
    // set the color to white
    col = parseColor(white_button.style.backgroundColor);
    setColor(col[0], col[1], col[2]);
    handleClickRequest(data);
});
