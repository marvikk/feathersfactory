//we need a couple of more buttonsees to start and stop the shift itself
// - gonna skip the start one, cos that aint needed
// - not even the stop shift button is needed. the stop event should trigger on itself, but for now will implement it for testing purposes
// - the stop shift will just save the up and down time data to db. otherwise this should be called automatically


//we need a new html template to push into the main div
//the tamplate needs to modify the db
//the db object might need a couple of new fields to reflect productivity
//we will need a new route for statistics. i dont think it needs to be pushed into the main div, but well see


const socket = io();
const client = feathers();

client.configure(feathers.socketio(socket));

const stationHTML = (stName, status, id, upTime, downTime) => `
  <h2>Station ${stName}
  </h2>
  <h4>
    <span>Status:</span>
    <div id="status${stName}" style="display: inline-block"> ${status}</div>
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
  <button class="btn btn-success" style="width: 49%; margin-bottom:5px" id="startBtn${stName}" onclick="startBtnClicked('${id}', ${stName})">Start</button>
  <button class="btn btn-danger" style="width: 49%; margin-bottom:5px" id="stopBtn${stName}" onclick="stopBtnClicked('${id}', ${stName})">Stop</button>
  <button class="btn btn-primary" style="width: 100%; margin-bottom:5px" id="expandBtn${stName}" onclick="expandBtnClicked('${id}', ${stName})">Expand</button>
  <button class="btn btn-primary" style="width: 100%; margin-bottom:5px" id="endBtn${stName}" onclick="endBtnClicked('${id}', ${stName})">End Shift</button>

`

let timers = {

};

let expandBtnClicked = async (id, stName) => {
    await client.service('station').patch(id, { status: "", upTime: "00:00:00", downTime: "00:00:00" });
}

let startBtnClicked = async (id, stName) => {

    await client.service('station').patch(id, { status: "Operating" });
}

let stopBtnClicked = async (id, stName) => {
    await client.service('station').patch(id, { status: "Down" });
}


let endBtnClicked = async (id, stName) => {

    await client.service('station').patch(id, {
        status: "End",
        upTime: timers[stName].upTimer != null ? timers[stName].upTimer.getTimeValues().toString() : null,
        downTime: timers[stName].downTimer != null ? timers[stName].downTimer.getTimeValues().toString() : null
    });
}

async function init() {

    renderStations();

    defineDbChangeEventHandlers();

}

const defineDbChangeEventHandlers = () => {
    client.service('station').on('patched', station => {

        var stationId = station.stationId;

        handleStationCss(stationId, station.status);

        if (timers[stationId] === undefined) {

            timers[stationId] = {
                upTimer: null,
                downTimer: null
            }

        };

        if (station.status == "Operating") {
            // $('#' + stationId).addClass('operating');
            // $('#' + stationId).removeClass('down');

            if (timers[stationId].downTimer != null) {
                timers[stationId].downTimer.pause();
            }

            timers[stationId].upTimer = timers[stationId].upTimer || new Timer();
            console.log(timers[stationId].upTimer.getTimeValues().toString() == "00:00:00");
            if (timers[stationId].upTimer.getTimeValues().toString() == "00:00:00") {
                timers[stationId].upTimer.start();
                timers[stationId].upTimer.addEventListener('secondsUpdated', function (e) {
                    $('#upTimer' + stationId).html(timers[stationId].upTimer.getTimeValues().toString());
                });
            }
            else {

                timers[stationId].upTimer.start();
            }
        }
        else if (station.status == "Down") {

            // $('#' + stationId).addClass('down');
            // $('#' + stationId).removeClass('operating');
            if (timers[stationId].upTimer != null) {
                timers[stationId].upTimer.pause();
            }

            timers[stationId].downTimer = timers[stationId].downTimer || new Timer();
            if (timers[stationId].downTimer.getTimeValues().toString() == "00:00:00") {
                timers[stationId].downTimer.start();
                timers[stationId].downTimer.addEventListener('secondsUpdated', function (e) {
                    $('#downTimer' + stationId).html(timers[stationId].downTimer.getTimeValues().toString());
                });
            }
            else {
                timers[stationId].downTimer.start();
            }
        }
        else if (station.status == "End") {
            // $('#' + stationId).removeClass('operating');
            // $('#' + stationId).removeClass('down');
            // $('#' + stationId).addClass('shiftEnded');

            if (timers[stationId].upTimer != null) {
                timers[stationId].upTimer.stop();
            }
            if (timers[stationId].downTimer != null) {
                timers[stationId].downTimer.stop();
            }
            console.log(station);
        }

    });
}

const handleStationCss = (stationId, status) => {

    if (status == "Operating") {
        $('#' + stationId).addClass('operating');
        $('#' + stationId).removeClass('down');
        $('#status' + stationId).html('Operating');

    }
    if (status == "Down") {
        $('#' + stationId).addClass('down');
        $('#' + stationId).removeClass('operating');
        $('#status' + stationId).html('Down');
    }
    if (status == "End") {
        $('#' + stationId).removeClass('operating');
        $('#' + stationId).removeClass('down');
        $('#' + stationId).addClass('shiftEnded');
        $('#status' + stationId).html('Shift Ended');
    }

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

init();
