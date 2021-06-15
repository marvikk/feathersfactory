//const app = require("../src/app");

const { default: Timer } = require("easytimer.js");

//const { default: Timer } = require("easytimer.js");

//const { default: Timer } = require("easytimer.js");

//const { default: Timer } = require("easytimer.js");

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
//client.configure(feathers.authentication());

const stationHTML = (stName, status, id, upTime, downTime) => `
  <h2>Station ${stName}
  </h2>
  <h4>
    <span>Status:</span>
    <div id="status" style="display: inline-block"> ${status}</div>
  </h4>
  <!-- Text input-->
  <div class="form-group">
    <div class="inputGroupContainer">
      <div class="input-group">
        <input name="stationId" placeholder="ID" class="form-control" type="hidden" value="">
      </div>
      <div>
        <span>Programmer:</span>
        <div id='pname${stName}' style="display: inline-block">-</div>
      </div>
      <div>
        <span>Operator:</span>
        <div id='oname' style="display: inline-block">-</div>
      </div>
      <div>
        <span>Up Time:</span>
        <div id='upTimer${stName}' style="display: inline-block">${upTime}</div>
      </div>
      <div>
      <span>Down Time:</span>
      <div id='downTimer${stName}' style="display: inline-block">${downTime}</div>
    </div>
    </div>
  </div>
  <button class="btn btn-primary" id="expandBtn${stName}" onclick="expandBtnClicked('${id}', ${stName})">Expand</button>
  <button class="btn btn-danger" id="stopBtn${stName}" onclick="stopBtnClicked('${id}', ${stName})">Stop</button>
  <button class="btn btn-success" id="startBtn${stName}" onclick="startBtnClicked('${id}', ${stName})">Start</button>
`

let timers = {
  0: {
    upTimer: "chirke",
    downTimer: "chirke"
  }
};

let expandBtnClicked = async (id, stName) => {
  await client.service('station').patch(id, { status: "", upTime: "00:00:00", downTime: "00:00:00" });
}

let startBtnClicked = async (id, stName) => {
  //1. change the status of the station
  //2. update db with the new status
  await client.service('station').patch(id, { status: "Operating" });

  //2. fetch db to get the upTime state
  //3. update the UI with the upTime state
  //4. resume or start the countdown continuing the upTime state

  // var upTimer = timers[stName].upTime;
  // var downTimer = timers[stName].downTime;
  // downTimer.pause();
  // upTimer.start();
  // upTimer.addEventListener('secondsUpdated', function (e) {
  //   $('#upTimer' + stName).html(upTimer.getTimeValues().toString());
  // });
  // upTimer.addEventListener('started', function (e) {
  //   $('#upTimer' + stName).html(upTimer.getTimeValues().toString());
  // });
  // upTimer.addEventListener('reset', function (e) {
  //   $('#upTimer' + stName).html(upTimer.getTimeValues().toString());
  //});
}

let stopBtnClicked = async (id, stName) => {
  await client.service('station').patch(id, { status: "Down" });
  console.log(timers);
  timers[0].upTimer.pause();

  // var upTimer = timers[stName].upTime;
  // var downTimer = timers[stName].downTime;
  // downTimer.start();
  // // upTimer.pause();
  // downTimer.addEventListener('secondsUpdated', function (e) {
  //   $('#downTimer' + stName).html(downTimer.getTimeValues().toString());
  // });
  // downTimer.addEventListener('started', function (e) {
  //   $('#downTimer' + stName).html(downTimer.getTimeValues().toString());
  // });
  // downTimer.addEventListener('reset', function (e) {
  //   $('#downTimer' + stName).html(downTimer.getTimeValues().toString());
  // });
}

async function init() {

  renderStations();
  //initTimers();

  // Updating the UI with ALL DB changes
  client.service('station').on('patched', station => {

    var stationId = station.stationId;
    timers[stationId].upTimer = timers[stationId].upTimer || new Timer();
    // var downTimer = timers[stationId][downtimerTimer];

    console.log(station);
    console.log(upTimer);
    if (station.status == "Operating") {
      if (upTimer != "chirke") {
        upTimer.start();
      }
      else {
        upTimer = new Timer();
        timers[stationId].upTimer = upTimer;
        upTimer.start();
        upTimer.addEventListener('secondsUpdated', function (e) {
          $('#upTimer' + stationId).html(upTimer.getTimeValues().toString());
        });
      }
    }

    //mass render to reflect ALL changes
    //renderStations();
    //updatePatchedStation();
  });

}

const renderStations = async () => {

  const allStations = await client.service('station').find();


  document.getElementById('app').innerHTML = '';


  allStations.data.forEach(
    station => {
      var stationContainer = document.createElement('div');
      stationContainer.className = 'station';
      stationContainer.id = station.stationId;
      if (station.status == "Operating") {
        stationContainer.classList.add('operating');
      }
      else if (station.status == "Down") {
        stationContainer.classList.add('down');
      }
      stationContainer.innerHTML = stationHTML(station.stationId, station.status, station['_id'], station.upTime, station.downTime);
      document.getElementById('app').appendChild(stationContainer);
    }
  );
}

// const initTimers = async () => {
//   const allStations = await client.service('station').find();

//   allStations.data.forEach(station => {
//     fillTimersArray(station.stationId);
//   })
// }

// const fillTimersArray = (stationName) => {
//   let timer = {};
//   timer.upTime = new Timer();
//   timer.downTime = new Timer();
//   timers[stationName] = timer;
// }


init();
