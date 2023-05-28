// This is a program which takes multiple continuous inputs (via serial)
// and converts trains multiple regression models
// 
// By Clarence and Yuri
// Leverages code from serial

// IN web serial v4, we add multiple input by modifying: onSerialReceived() function and draw function 

//model variables
let trainButton, saveButton, collectButton; // training buttons
let category;
let sel;
let predictMode = false;
let collectMode1 = false;
let collectMode2 = false;
let collectMode3 = false; 
let letter;

//initialize the input values
let inputArray;
let inputValue1;
let inputValue2;
let inputValue3;

//sine player
let freqSlider1;
let osc1;
let freqMax = 800

//sine player
let freqSlider2;
let osc2;

//sine player
let freqSlider3;
let osc3;

//serial reader variables
let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;

let model1; 

function setup() {
  createCanvas(640, 480);
  background(220);
  
  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
  
  //regression model 1 set up
  trainButton1 = createButton('train 1');
  trainButton1.position(350,20);
  trainButton1.mousePressed(trainModel1);

  collectButton1 = createButton('collect 1');
  collectButton1.position(400,20);
  collectButton1.mousePressed(function(){ collectMode1 = !collectMode1; console.log("collect button pressed " + collectMode1)});
  
  let options = {
    learningRate: 0.002,
    task: 'regression',
    debug: 'true'
  };
   
  model1 = ml5.neuralNetwork(options);

  
  // sine player GUI
  freqSlider1 = createSlider(80, 880, 440);
  freqSlider1.position(20,20);
  freqSlider1.style('width', '280px');

  // Sound
  osc1 = new p5.Oscillator();
  osc1.setType('sine');
  osc1.amp(1);
  osc1.start();
  
  // sine player GUI
  freqSlider2 = createSlider(80, 880, 440);
  freqSlider2.position(20,40);
  freqSlider2.style('width', '280px');

  // Sound
  osc2 = new p5.Oscillator();
  osc2.setType('sine');
  osc2.amp(1);
  osc2.start();
  
  // sine player GUI
  freqSlider3 = createSlider(80, 880, 440);
  freqSlider3.position(20,60);
  freqSlider3.style('width', '280px');

  // Sound
  osc3 = new p5.Oscillator();
  osc3.setType('sine');
  osc3.amp(1);
  osc3.start();
}

function draw() {
  background(220);
  
  textAlign(CENTER, CENTER);
  fill(255,0,0);
  textSize(200);
  text(letter, width/2, height/2);
  
  //text(freqSlider1.value(), 300, 30);
  osc1.freq(freqSlider1.value());
  osc2.freq(freqSlider2.value());
  osc3.freq(freqSlider3.value());

    
    if (predictMode){
      console.log("we have entered in predict mode");
      //let newDataInputPredict = "123/232/321/123"
      //let newDataInputPredict = ""+random()+"/"+random()+"/"+random(); // this simulates the serial input string with different values for each sensor
      

      
      //recast the input values into a new array for input
      let inputArray1 = [];
      inputArray1.push(inputValue1); // extracting the input values from the array
      inputArray1.push(inputValue2); 
      inputArray1.push(inputValue3);
      
      
      if(model1.ready) {
        model1.predict(inputArray1 , gotResults1); }
    }
    else if (collectMode1){
      
      //let newDataInput = ""+random()+"/"+random()+"/"+random() 
      //let inputArray=newDataInput.split("/").map(Number);
      
      //extract the values from input array and enter them 1 by 1 for training
      let inputs = [];
      inputs.push(inputValue1);
      inputs.push(inputValue2);
      inputs.push(inputValue3);
            
      let outputs = [];
      outputs.push(freqSlider1.value());
      outputs.push(freqSlider2.value());
      outputs.push(freqSlider3.value());
      
      console.log("---adding data---" + inputValue1 + "," + inputValue2 + "," + inputValue3);
      model1.addData(inputs, outputs);
      //console.log(inputV, target);
      
    }
  
  
}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
 function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  //console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
  
  //pass the string into serial as /value/value/value make sure the / comes first
  
  //parses the newData string into an global inputArray variable
  inputArray=newData.split("/").map(Number);
  inputValue1 = inputArray[0];
  inputValue2 = inputArray[1];
  inputValue3 = inputArray[2];
  
  if(isNaN(inputValue1)) { inputValue1 = 0; }
  if(isNaN(inputValue2)) { inputValue2 = 0; }
  if(isNaN(inputValue3)) { inputValue3 = 0; }
  
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}

//train model 
function trainModel1(){
  console.log('starting training model 1');
  model1.normalizeData();
  let options1 = {
    epochs: 50
  }
  model1.train(options1, whileTraining, finishedTraining);
  
}


function whileTraining(epoch, loss) {
  console.log(epoch);
}

function finishedTraining() {
  console.log('finished training.');
  predictMode = true;
}

function gotResults1(error, results) {
  if (error) {
    console.log("entered error at gotResults");
    console.error(error);
    return;
  }
  if (results){
    console.log(results);
    b = results[0]["value"];
    c = results[1]["value"];
    d = results[2]["value"];
    //letter = results[0]["label"];
    //letter = b;
    freqSlider1.value(b);
    freqSlider2.value(c);
    freqSlider3.value(d);
    console.log("got results " + b);
  }

}

