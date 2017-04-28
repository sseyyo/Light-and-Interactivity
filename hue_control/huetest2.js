var url = "128.122.151.170";           // the hub IP address
var username = "DMIO-mypHztIzBIn8xRjOQbURuxI8vOOzvwqkI-b"       // fill in your Hub-given username here
var usernameField;
var addressField;
var controlArray = new Array(); // array of light control divs
var bri = 0;
var otherBri;
var interval;

function setup() {
  var addressLabel, nameLabel, connectButton;
  noCanvas();
  // set up the address and username fields:
  addressField = createInput('text');
  addressLabel = createSpan("IP address:");
  addressLabel.position(10,10);
  addressField.position(100, 10);
  usernameField = createInput('text');
  nameLabel = createSpan("user name:");
  nameLabel.position(10,40);
  usernameField.position(100, 40);
  usernameField.value(username);
  addressField.value(url);

  // set up the connect button:
  connectButton = createButton("connect");
  connectButton.position(100, 70);
  connectButton.mouseClicked(connect);


  var flipButton;
    flipButton = createButton("flip");
    flipButton.position(100, 90);
    flipButton.mouseClicked(flip);
}

/*
this function makes the HTTP GET call
to get the light data
*/


var flipBoolean = false;
function flip()
{
  flipBoolean = true;
  console.log(flipBoolean);
}

function connect() {
  this.html("refresh");             // change the connect button to 'refresh'
  for (control in controlArray) {
    controlArray[control].remove(); // clear the lights div on reconnect
  }
  controlArray = [];                // clear the control array
  url = "http://" + addressField.value() + '/api/' + usernameField.value() + '/lights/';
  httpGet(url, getLights);



}


/*
this function uses the response from the hub
to create a new div for the UI elements
*/
function getLights(result) {

  var lights = JSON.parse(result);		// parse the HTTP response
  var yPos = 100;                     // y position for the div
  for (thisLight in lights) {			    // iterate over each light in the response
    var controlDiv = createDiv('');		// create a div
    controlDiv.id(thisLight);				  // name it
    controlDiv.position(10, yPos);	  // position it
    controlArray.push(controlDiv);    // add it to array of light controls
    // create an input field:
    var nameField = createInput(lights[thisLight].name, 'text');
    nameField.id(lights[thisLight].name);  // give the input a value
    controlDiv.child(nameField);		  // add the field to the light's div
    nameField.position(0, 0);         // position the field
    nameField.mouseReleased(changeName);   // add a mouseReleased behavior

    // create the controls inside it:
    createControl(lights[thisLight], controlDiv);
    yPos += controlDiv.height;				// increment yPos for the next div
  }
}

/*
this function creates UI controls from the lights data
returned by the hub
*/
function createControl(thisLight, thisDiv) {
  var state = thisLight.state;	// state of this light
  var myLabel;                  // each control will get a label
  var myInput;                  // and input
  var x = 0;                    // and an x-y position
  var y = 10;
  var xIndent = 100;            // distance from label to control

  for (property in state) {     // iterate over  properties in state object
    myInput = null;             // clear myInput from previous control
    switch (property) {         // handle the cases you care about
      case 'on':
        myInput = createInput();  // an input for the on property
        myInput.attribute('type', 'button');    // make this input a checkbox
        myInput.attribute('checked', state.on);	  // is called 'checked'
        myInput.mouseClicked(changeBri); // set the mouseClicked callback
        x = 200;      // the on checkbox has a special position
        y = 0;        // and it sits at the top of the div
        xIndent = 20; // and closer to its label
        break;
      case 'bri':
        // myInput = **********
        myInput = createInput();	// a slider for brightness
        myInput.attribute('type', 'button');
        myInput.mouseReleased(changeBri); // set the mouseClicked callback
        x = 10;       // all the other inputs start at the left edge
        xIndent = 100;
        break;
      case 'reachable':
        myInput = createSpan(state.reachable);	// a label for reachable
        break;
    }

    // you only created inputs for the fields in the switch statement
    // above, so this conditional filters for those:
    if (myInput != null) {
      myLabel = createSpan(property);   // create a label span
      myInput.id(property);             // give the input an id
      thisDiv.child(myLabel);		        // add the label to the light's div
      thisDiv.child(myInput);		        // add the input to the light's div
      myLabel.position(x, y);           // position the label
      myInput.position(x + xIndent, y); // position the input
      y += 20;                          // increment the y position
    }
  }   // end of for-loop to create controls
  thisDiv.size(250, y+20);       // resize the div with a little padding
}

/*
  This function formats the name change request, then calls
  the request.
*/
function changeName() {
    var lightName = event.target.value;				// what did you click on?
    var thisLight = event.target.parentNode.id;	// get the parent (light number)
    var payload = {"name": lightName};        // form the name payload
    //**
    if(thisLight == 1){
      var thatLight = 2;
    }else{
      thatLight = 1;
    }
    //**

    setLight(thisLight, payload, 'name');     // make the HTTP call
    //**
    setOtherLight(thatLight, payload, 'name');
    //**
    console.log(thisLight);
}



/*
this function uses the UI elements to change
the properties of the lights
*/
function changeProperty() {
  // var thisControl = event.target.id;				// what did you click on?
  // var thisLight = event.target.parentNode.id;	// get the parent (light number)
  var value = bri;					// get the value
  var otherValue = otherBri;
  // make a new payload:
  var payload = {};
  var thatPayload = {};
  // put the value for the given control into the payload:
  payload[thisControl] = Number(value);   // convert strings to numbers
  thatPayload[thatControl] = Number(otherValue);

  // the 'on' control is a special case, it's true/false
  // because it's a checkbox:
  // if (thisControl === 'on') {
  //   payload[thisControl] = event.target.checked;
  //   console.log("payload: " + payload[thisControl]);
  // }
    setLight(thisLight, payload, 'state');
    setLight(thatLight, thatPayload, 'state');// make the HTTP call
  // console.log(payload);
}

var thisControl;				// what did you click on?
var thisLight;	// get the parent (light number)
var thatLight = 2;

function changeBri() {
  thisControl = event.target.id;
  thatControl = event.target.id;		// what did you click on?
  thisLight = event.target.parentNode.id;	// get the parent (light number)
  console.log("id: "+thisLight);
  //interval = setInterval(fading, 84000);
  interval = setInterval(fading, 300);
}

var increasing = true;
var fadeAmount = 5;

function fading(){
  //240
  bri = bri + fadeAmount;

  // reverse the direction of the fading at the ends of the fade:
  if (flipBoolean) { //flip light direction when you flip the light
    fadeAmount = -fadeAmount ;
    flipBoolean = false;
    console.log(flipBoolean);
  }

  if(bri > 255)
  {
    bri = 255;
  }
  if(bri < 0)
  {
    bri = 0;
  }
  otherBri = 255 - bri;
    changeProperty();
}

/*
this function makes an HTTP PUT call to change
the properties of the lights
*/
function setLight(lightNumber, data, command) {
  var path = url + lightNumber + '/' + command;		// assemble the full URL
  var content = JSON.stringify(data);				  // convert JSON obj to string
  // HttpDo seems to have a bug in it when it comes to PUT, so I've
  // used jQuery instead here.
  //httpDo( path, 'PUT', content, 'text', getLights);

  var requestParams = {
    type: "PUT",					  // use the PUT method
    url: path,						  // URL to call
    data: content,					// body of the request
    dataType: 'text'		// data type of the body
  };

  var request = $.ajax(requestParams, getLights);
}

//**
function setOtherLight(lightNumber, data, command) {
  var path = url + lightNumber + '/' + command;		// assemble the full URL
  var content = JSON.stringify(data);				  // convert JSON obj to string
  // HttpDo seems to have a bug in it when it comes to PUT, so I've
  // used jQuery instead here.
  //httpDo( path, 'PUT', content, 'text', getLights);

  var requestParams = {
    type: "PUT",					  // use the PUT method
    url: path,						  // URL to call
    data: content,					// body of the request
    dataType: 'text'		// data type of the body
  };

  var request = $.ajax(requestParams, getLights);
}
