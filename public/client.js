//we need a couple of more buttonsees to start and stop the shift itself
// - gonna skip the start one, cos that aint needed
// - not even the stop shift button is needed. the stop event should trigger on itself, but for now will implement it for testing purposes
// - the stop shift will just save the up and down time data to db. otherwise this should be called automatically

//const { default: Timer } = require("easytimer.js");

//const { default: Timer } = require("easytimer.js");


//we need a new html template to push into the main div
//the tamplate needs to modify the db
//the db object might need a couple of new fields to reflect productivity
//we will need a new route for statistics. i dont think it needs to be pushed into the main div, but well see


const socket = io();
const client = feathers();

client.configure(feathers.socketio(socket));

const stationHTML = (stName, status, id, upTime, downTime, programmerName, operatorName, targetAmount) => `
<button class="btn btn-info" style="width: 49%; margin-bottom:5px" id="expandBtn${stName}" onclick="expandBtnClicked('${id}', ${stName})">Expand</button>
<button class="btn btn-secondary" style="width: 49%; margin-bottom:5px" id="resetBtn${stName}" onclick="resetBtnClicked('${id}', ${stName})">Reset</button>
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
        <div id='pname${stName}' style="display: inline-block">${programmerName}</div>
      </div>
      <div>
        <span>Operator:</span>
        <div id='oname${stName}' style="display: inline-block">${operatorName}</div>
      </div>
      <div>
      <span>Target Amount:</span>
      <div id='tamount${stName}' style="display: inline-block">${targetAmount}</div>
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
  <button class="btn btn-primary" style="width: 100%; margin-bottom:5px" id="endBtn${stName}" onclick="endBtnClicked('${id}', ${stName})">End Shift</button> 
`

const formHTML = (programmerName, operatorName, shiftStart, shiftEnd, targetAmount) => `
<div class="container">

<form class="well form-horizontal" id="detailForm" role='form'>

    <!-- Form Name -->
    <legend id="stationName"></legend>


    <!-- Text input-->

    <div class="form-group">
        <label class="col-md-4 control-label">Programmer Name</label>
        <div class="col-md-4 inputGroupContainer">
            <div class="input-group">
                <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                <input id="programmer_name" name="programmer_name" placeholder="Programmer Name"
                class="form-control" type="text">
            </div>
        </div>
    </div>

    <!-- Text input-->
    <div class="form-group">
        <label class="col-md-4 control-label">Operator Name</label>
        <div class="col-md-4 inputGroupContainer">
            <div class="input-group">
                <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                <input name="operator_name" id="operator_name" placeholder="Operator Name" 
                class="form-control" type="text">
            </div>
        </div>
    </div>

    <input id="stationId" type="hidden" name='stationId'>

    <!-- Select Basic -->

    <div class="form-group">
        <label class="col-md-4 control-label">Shift Start</label>
        <div class="col-md-4 selectContainer">
            <div class="input-group">
                <span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>
                <select name="shift_start" class="form-control selectpicker" id="shift_start">
                    <option value="00:00">12.00 AM</option>
                    <option value="00:30">12.30 AM</option>
                    <option value="01:00">01.00 AM</option>
                    <option value="01:30">01.30 AM</option>
                    <option value="02:00">02.00 AM</option>
                    <option value="02:30">02.30 AM</option>
                    <option value="03:00">03.00 AM</option>
                    <option value="03:30">03.30 AM</option>
                    <option value="04:00">04.00 AM</option>
                    <option value="04:30">04.30 AM</option>
                    <option value="05:00">05.00 AM</option>
                    <option value="05:30">05.30 AM</option>
                    <option value="06:00">06.00 AM</option>
                    <option value="06:30">06.30 AM</option>
                    <option value="07:00">07.00 AM</option>
                    <option value="07:30">07.30 AM</option>
                    <option value="08:00">08.00 AM</option>
                    <option value="08:30">08.30 AM</option>
                    <option value="09:00">09.00 AM</option>
                    <option value="09:30">09.30 AM</option>
                    <option value="10:00">10.00 AM</option>
                    <option value="10:30">10.30 AM</option>
                    <option value="11:00">11.00 AM</option>
                    <option value="11:30">11.30 AM</option>
                    <option value="12:00">12.00 PM</option>
                    <option value="12:30">12.30 PM</option>
                    <option value="13:00">01.00 PM</option>
                    <option value="13:30">01.30 PM</option>
                    <option value="14:00">02.00 PM</option>
                    <option value="14:30">02.30 PM</option>
                    <option value="15:00">03.00 PM</option>
                    <option value="15:30">03.30 PM</option>
                    <option value="16:00">04.00 PM</option>
                    <option value="16:30">04.30 PM</option>
                    <option value="17:00">05.00 PM</option>
                    <option value="17:30">05.30 PM</option>
                    <option value="18:00">06.00 PM</option>
                    <option value="18:30">06.30 PM</option>
                    <option value="19:00">07.00 PM</option>
                    <option value="19:30">07.30 PM</option>
                    <option value="20:00">08.00 PM</option>
                    <option value="20:30">08.30 PM</option>
                    <option value="21:00">09.00 PM</option>
                    <option value="21:30">09.30 PM</option>
                    <option value="22:00">10.00 PM</option>
                    <option value="22:30">10.30 PM</option>
                    <option value="23:00">11.00 PM</option>
                    <option value="23:30">11.30 PM</option>
                </select>
            </div>
        </div>
    </div>


    <div class="form-group">
        <label class="col-md-4 control-label">Shift End</label>
        <div class="col-md-4 selectContainer">
            <div class="input-group">
                <span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>
                <select name="shift_end" class="form-control selectpicker" id="shift_end">
                    <option value="00:00">12.00 AM</option>
                    <option value="00:30">12.30 AM</option>
                    <option value="01:00">01.00 AM</option>
                    <option value="01:30">01.30 AM</option>
                    <option value="02:00">02.00 AM</option>
                    <option value="02:30">02.30 AM</option>
                    <option value="03:00">03.00 AM</option>
                    <option value="03:30">03.30 AM</option>
                    <option value="04:00">04.00 AM</option>
                    <option value="04:30">04.30 AM</option>
                    <option value="05:00">05.00 AM</option>
                    <option value="05:30">05.30 AM</option>
                    <option value="06:00">06.00 AM</option>
                    <option value="06:30">06.30 AM</option>
                    <option value="07:00">07.00 AM</option>
                    <option value="07:30">07.30 AM</option>
                    <option value="08:00">08.00 AM</option>
                    <option value="08:30">08.30 AM</option>
                    <option value="09:00">09.00 AM</option>
                    <option value="09:30">09.30 AM</option>
                    <option value="10:00">10.00 AM</option>
                    <option value="10:30">10.30 AM</option>
                    <option value="11:00">11.00 AM</option>
                    <option value="11:30">11.30 AM</option>
                    <option value="12:00">12.00 PM</option>
                    <option value="12:30">12.30 PM</option>
                    <option value="13:00">01.00 PM</option>
                    <option value="13:30">01.30 PM</option>
                    <option value="14:00">02.00 PM</option>
                    <option value="14:30">02.30 PM</option>
                    <option value="15:00">03.00 PM</option>
                    <option value="15:30">03.30 PM</option>
                    <option value="16:00">04.00 PM</option>
                    <option value="16:30">04.30 PM</option>
                    <option value="17:00">05.00 PM</option>
                    <option value="17:30">05.30 PM</option>
                    <option value="18:00">06.00 PM</option>
                    <option value="18:30">06.30 PM</option>
                    <option value="19:00">07.00 PM</option>
                    <option value="19:30">07.30 PM</option>
                    <option value="20:00">08.00 PM</option>
                    <option value="20:30">08.30 PM</option>
                    <option value="21:00">09.00 PM</option>
                    <option value="21:30">09.30 PM</option>
                    <option value="22:00">10.00 PM</option>
                    <option value="22:30">10.30 PM</option>
                    <option value="23:00">11.00 PM</option>
                    <option value="23:30">11.30 PM</option>
                </select>
            </div>
        </div>
    </div>


    <!-- Text input-->

    <div class="form-group">
        <label class="col-md-4 control-label">Target Amount</label>
        <div class="col-md-4 inputGroupContainer">
            <div class="input-group">
                <span class="input-group-addon"><i class="glyphicon glyphicon-wrench"></i></span>
                <input id="target_amount" name="target_amount" placeholder="Target Amount" 
                class="form-control" type="text">
            </div>
        </div>
    </div>

    <!-- Button -->
    <div class="form-group">
        <label class="col-md-4 control-label"></label>
        <div class="col-md-4">
            <button type="submit" class="btn btn-success" id="stationInputSubmit">Save<span
                    class="glyphicon glyphicon-floppy-save"></span></button>
        </div>
    </div>

</form>
</div>
</div><!-- /.container -->
`

let timers = {

};

let expandBtnClicked = async (id, stName) => {
  const selectedStation = await client.service('station').get(id);
  console.log(selectedStation);
  //prefill form with data
  $('#app').html(formHTML);
  $('#stationName').html('Station ' + selectedStation.stationId);
  $('#programmer_name').val(selectedStation.programmerName);
  $('#operator_name').val(selectedStation.operatorName);
  $('#shift_start').val(selectedStation.shiftStart);
  $('#shift_end').val(selectedStation.shiftEnd);
  $('#target_amount').val(selectedStation.targetAmount);


  $('#stationInputSubmit').click((e) => {
    e.preventDefault();

    if ($('#programmer_name').val() != "" && $('#operator_name').val() != "" && $('#target_amount').val() != "") {
      //path station with new or modified form data
      patchStation(id, {
        programmerName: $('#programmer_name').val(),
        operatorName: $('#operator_name').val(),
        shiftStart: $('#shift_start').val(),
        shiftEnd: $('#shift_end').val(),
        targetAmount: $('#target_amount').val()
      });

      renderStations();
    } else {
      alert('Please fill out all the empty fields!')
    }
  });

}


let resetBtnClicked = async (id, stName) => {
  let resetDataObj = {
    programmerName: "", operatorName: "", shiftStart: "10:00", shiftEnd: "18:00",
    targetAmount: "", status: "", upTime: "00:00:00", downTime: "00:00:00"
  };
  //await client.service('station').patch(id, { status: "", upTime: "00:00:00", downTime: "00:00:00" });
  timers[stName].upTime = new Timer();

  timers[stName].downTime = new Timer();
  patchStation(id, resetDataObj);
  renderStations();
}

let startBtnClicked = async (id, stName) => {

  //await client.service('station').patch(id, { status: "Operating" });
  patchStation(id, { status: "Operating" });

}

let stopBtnClicked = async (id, stName) => {
  //await client.service('station').patch(id, { status: "Down" });
  patchStation(id, { status: "Down" });
}


let endBtnClicked = async (id, stName) => {

  // await client.service('station').patch(id, {
  //   status: "End",
  // });
  console.log(timers[stName].upTime.getTimeValues().toString(), timers[stName].downTime.getTimeValues().toString());
  patchStation(id, { status: "End", upTime: timers[stName].upTime.getTimeValues().toString(), downTime: timers[stName].downTime.getTimeValues().toString() });
  let station = await client.service('station').get(id);
  station.dataSubmitted = new Date().toLocaleString();

  var a = moment(station.shiftStart.split(':'), "HH:mm")
  var b = moment(station.shiftEnd.split(':'), "HH:mm")
  var diff = b.diff(a, 'hours');
  station.shiftDuration = diff;
  var hoursInMinutes = diff * 60 + 5;
  station.detailsPerHourTarget = Math.floor(station.targetAmount / diff);
  var downtimeInMinutes = parseInt("02:23:00".split(':')[0]) * 60 + parseInt("02:23:00".split(':')[1]);
  var downtimetInHours = (downtimeInMinutes / 60).toFixed(3);
  var targetDeficit = Math.floor(station.detailsPerHourTarget * downtimetInHours);
  station.targetDeficit = targetDeficit;
  station.targetActuallyProduced = station.targetAmount - station.targetDeficit;
  // console.log(station);
  // console.log(diff);
  // console.log(minutes_to_hhmm(hoursInMinutes));
  console.log(station);
  //console.log(targetWithDowntime);

  function minutes_to_hhmm(hoursInMinutes) {
    //create duration object from moment.duration  
    var duration = moment.duration(hoursInMinutes, 'minutes');

    //calculate hours
    var hh = (duration.years() * (365 * 24)) + (duration.months() * (30 * 24)) + (duration.days() * 24) + (duration.hours());

    //get minutes
    var mm = duration.minutes();

    //return total time in hh:mm format
    return hh + ':' + mm;
  }

  //client.service('statistics').create()

}

const patchStation = async (id, stationValuesObject) => {
  await client.service('station').patch(id, stationValuesObject);
}

const submitDataForStatistics = async (data) => {
  await client.service('statistics').create(data);
}

async function init() {

  renderStations();

  defineDbChangeEventHandlers();

}

const defineDbChangeEventHandlers = () => {
  client.service('station').on('patched', station => {

    //console.log('patched');

    var stationId = station.stationId;
    var status = station.status;
    var id = station._id;

    handleStationCss(stationId, status);
    handleTimersBasedOnStatus(stationId, status, id);

  });
}

const handleTimersBasedOnStatus = (stationId, status, id) => {

  if (status == "Operating") {

    if (timers[stationId].downTime.isRunning() == true) {
      timers[stationId].downTime.pause();
    }

    if (timers[stationId].upTime.isRunning() == false) {
      timers[stationId].upTime.start();
      timers[stationId].upTime.addEventListener('secondsUpdated', function (e) {
        //console.log('event listener triggered');
        $('#upTimer' + stationId).html(timers[stationId].upTime.getTimeValues().toString());
      });
      setInterval(() => {
        //console.log(timers[stationId].upTime.getTimeValues().toString());
        patchStation(id, { upTime: timers[stationId].upTime.getTimeValues().toString() })
      }, 1000)
    }

  }
  else if (status == "Down") {

    if (timers[stationId].upTime.isRunning() == true) {
      timers[stationId].upTime.pause();
    }
    if (timers[stationId].downTime.isRunning() == false) {
      timers[stationId].downTime.start();
      timers[stationId].downTime.addEventListener('secondsUpdated', function (e) {
        $('#downTimer' + stationId).html(timers[stationId].downTime.getTimeValues().toString());
      });
      setInterval(() => {
        //console.log(timers[stationId].downTime.getTimeValues().toString());
        patchStation(id, { downTime: timers[stationId].downTime.getTimeValues().toString() })
      }, 1000)
    }

  }
  else if (status == "End") {
    if (timers[stationId].downTime.isPaused() == false) {
      timers[stationId].downTime.pause();
    }

    if (timers[stationId].upTime.isPaused() == false) {
      timers[stationId].upTime.pause();
    }
  }
}

const handleStationCss = (stationId, status) => {

  var programmerName = $('#pname' + stationId).html();
  var operatorName = $('#oname' + stationId).html();
  //var shiftStart = $('#shift_start'+stationId).val();
  //var shiftEnd = $('#shift_end'+stationId).val();
  var targetAmount = $('#target_amount' + stationId).val();
  var startButton = $('#startBtn' + stationId);
  var stopButton = $('#stopBtn' + stationId);
  var endButton = $('#endBtn' + stationId);
  var expandButton = $('#expandBtn' + stationId);


  if (programmerName == "" || operatorName == "" || targetAmount == "") {
    startButton.prop('disabled', true);
    stopButton.prop('disabled', true);
    endButton.prop('disabled', true);
  }

  if (status == "Operating") {
    $('#' + stationId).addClass('operating');
    $('#' + stationId).removeClass('down');
    $('#status' + stationId).html('Operating');
    startButton.prop('disabled', true);
    expandButton.prop('disabled', true);
    stopButton.prop('disabled', false);
    endButton.prop('disabled', false);
  }
  else if (status == "Down") {
    $('#' + stationId).addClass('down');
    $('#' + stationId).removeClass('operating');
    $('#status' + stationId).html('Down');
    stopButton.prop('disabled', true);
    expandButton.prop('disabled', true);
    startButton.prop('disabled', false);
    endButton.prop('disabled', false);
  }
  else if (status == "End") {
    $('#' + stationId).removeClass('operating');
    $('#' + stationId).removeClass('down');
    $('#' + stationId).addClass('shiftEnded');
    $('#status' + stationId).html('Shift Ended');
    startButton.prop('disabled', true);
    expandButton.prop('disabled', true);
    stopButton.prop('disabled', true);
    endButton.prop('disabled', true);
  }
  else {
    $('#' + stationId).removeClass('operating');
    $('#' + stationId).removeClass('down');
    $('#' + stationId).removeClass('shiftEnded');
    $('#status' + stationId).html('');
    $('#upTimer' + stationId).html('00:00:00');
    $('#downTimer' + stationId).html('00:00:00');
    stopButton.prop('disabled', true);
    endButton.prop('disabled', true);

  }

}

const renderStations = async () => {

  const allStations = await client.service('station').find();


  document.getElementById('app').innerHTML = '';


  allStations.data.forEach(
    station => {
      initOrFatchTimers(station.stationId, station.upTime, station.downTime);
      var stationContainer = document.createElement('div');
      stationContainer.className = 'station';
      stationContainer.id = station.stationId;
      stationContainer.innerHTML = stationHTML(station.stationId, station.status,
        station['_id'], timers[station.stationId].upTime.getTimeValues().toString(),
        timers[station.stationId].downTime.getTimeValues().toString(), station.programmerName,
        station.operatorName, station.targetAmount);
      document.getElementById('app').appendChild(stationContainer);
      handleStationCss(station.stationId, station.status);
      handleTimersBasedOnStatus(station.stationId, station.status, station._id);
    }
  );
}

const initOrFatchTimers = (stationId, upT, downT) => {
  if (timers[stationId] === undefined) {

    timers[stationId] = {
      upTime: new Timer(),
      downTime: new Timer()
    }

    if (upT != "00:00:00") {
      let time = upT.split(':');
      if (timers[stationId].downTime.isRunning() == false) {

        timers[stationId].upTime.start({ startValues: { hours: parseInt(time[0]), minutes: parseInt(time[1]), seconds: parseInt(time[2]) } });
        timers[stationId].upTime.pause();
      }
    }
    if (downT != "00:00:00") {
      let time = downT.split(':');
      if (timers[stationId].downTime.isRunning() == false) {

        timers[stationId].downTime.start({ startValues: { hours: parseInt(time[0]), minutes: parseInt(time[1]), seconds: parseInt(time[2]) } });
        timers[stationId].downTime.pause();
      }
    }

  };
}

init();
