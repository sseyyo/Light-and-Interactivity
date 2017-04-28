var brightness = 0;
var otherBri;
var interval;

var thisLight = 1;	// get the parent (light number)
var thatLight = 2;

var fadeAmount = 5;

var payload;
var offPayload;
var offthatPayload;
var thatPayload;

// var SerialPort = require('serialport'),
// 	portName =  process.argv[2],								// where to know?
// 	portConfig = {
// 		baudRate: 9600,
// 		parser: SerialPort.parsers.readline('\n')
// 	};
//
// var myPort = new SerialPort(portName, portConfig);

var http = require('http');

function callback(response) {
    var result = '';		// '' capture string? empty?

    response.on('data', function (data) {
      result += data;
    }

  /////////

    var flipBoolean = false;
    function flip() {
      flipBoolean = true;
      console.log(flipBoolean);
    }

    //if gets serial -> flip();

    function changeBri() {
      console.log("id: "+thisLight);
      interval = setInterval(fading, 300);

      // to stop interval:
      clearInterval(interval);
    }

    function fading(){
      brightness = brightness + fadeAmount;
      // reverse the direction of the fading at the ends of the fade:
      if (flipBoolean) { //flip light direction when you flip the light
        fadeAmount = -fadeAmount ;
        flipBoolean = false;
        console.log(flipBoolean);
      }

      if(brightness > 255){
        brightness = 255;
        thatPayload = offthatPayload;
      }
      else if(brightness < 0){
        brightness = 0;
        payload = offPayload;
      }
      else{
        payload = payload;
        thatPayload = thatPayload;
      }
      otherBri = 255 - brightness;
      changeProperty();
    }

    function changeProperty() {
      var value = brightness;
      var otherValue = otherBri;

      payload = {
        bri: brightness
        on: true
      };
      thatPayload = {
        bri: otherBri,
        on: true
      };
      offPayload = {
        on: false
      };
      offthatPayload = {
        on: false
      };

      setLight(thisLight, payload); //payload is 'data'
      setLight(thatLight, thatPayload);
    }

    function setLight(lightNumber, data, command) {
      var url = "128.122.151.170";
      var path =  "/api/DMIO-mypHztIzBIn8xRjOQbURuxI8vOOzvwqkI-b/lights/" + lightNumber + '/state';		// assemble the full URL
      var content = JSON.stringify(data);

      var options = {
        host: '128.122.151.170',
        port: 80, //what is port
        type: "PUT",
        url: path,						  // URL to call
        data: content,					// body of the request
        dataType: 'text'
      };

    var request = http.request(options, callback);	// start it
    request.end();

/////////

});

  // when the final chunk comes in, print it out:
  response.on('end', function () {
    console.log(result);
  });
}


myPort.on('open', openPort);			// called when the serial port opens
myPort.on('close', closePort);		// called when the serial port closes
myPort.on('error', serialError);	// called when there's an error with the serial port
myPort.on('data', listen);				// called when there's new incoming serial data

function openPort() {
  console.log('port open');
  console.log('baud rate: ' + myPort.options.baudRate);
}

function closePort() {
  console.log('port closed');
}

function serialError(error) {
  console.log('there was an error with the serial port: ' + error);
  myPort.close();
}

function listen(data) {
  // console.log(data);
  request
}
