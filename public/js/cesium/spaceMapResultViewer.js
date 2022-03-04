const { initialize } = require('passport');

Cesium.Ion.defaultAccessToken =
  'token';

// Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.

const viewer = new Cesium.Viewer('cesiumContainer', {
  // sceneMode: Cesium.SceneMode.SCENE3D,
  terrainProvider: Cesium.EllipsoidTerrainProvider(),

  // its for minimize...
  // skyBox: false,
  baseLayerPicker: true,
  geocoder: false,
  // scene3DOnly: true,
  skyBox: false,
  skyAtmosphere: false,
  selectionIndicator: false,
  requestRenderMode: true,
  maximumRenderTimeChange: 0.05,
});
var scene = viewer.scene;
// scene.requestRenderMode = true;
scene.debugShowFramesPerSecond = true;
console.log(viewer.camera);
viewer.camera.defaultZoomAmount = 100.0;
console.log(viewer.camera);
console.log(viewer.defaultZoomAmount);

viewer.useDefaultRenderLoop = false;

function myOwnRenderLoop() {
  viewer.resize();
  viewer.render();
  Cesium.requestAnimationFrame(myOwnRenderLoop);
}

Cesium.requestAnimationFrame(myOwnRenderLoop);

const apartColor = [0, 255, 128, 255];
const closeColor = [255, 0, 0, 255];

//////Minimize
// scene.highDynamicRange = false;
// scene.creditContainer = false;
// scene.creditViewport = false;
// scene.fxaa = false;
//////Minimize
// const timeline = new Cesium.Timeline('cesium-timeline-bar');

// let tleUpdate = setInterval(function() {
//   var currentTime = viewer.clock.currentTime;
//   try{
//     var tleDSTime = tlesDataSource.clock.stopTime;
//     // drawTLEs(currentTime);
//     if (Cesium.JulianDate.secondsDifference(currentTime, tleDSTime) > -600)  {
//       console.log(Cesium.JulianDate.secondsDifference(currentTime, tleDSTime));
//       drawCurrTimeTLEs(currentTime);
//     }
//     else{
//       console.log(Cesium.JulianDate.secondsDifference(currentTime, tleDSTime));
//     }
//   }
//   catch{
//   }
// }, 2000)
// viewer.clock.onTick.addEventListener(function (clock) {

// });

var tlesDataSource = new Cesium.CzmlDataSource();
viewer.dataSources.add(tlesDataSource);

var userdbDataSource = new Cesium.CzmlDataSource();
viewer.dataSources.add(userdbDataSource);

//////////////////////////////////////////

const intervalUnitTime = 600;
const duration = 172800;
let lastTlesCZMLUpdatedTime;
let RSOParameterResponseData;

initializeViewer();

async function initializeViewer(RSOParameterResponseData) {
  RSOParameterResponseData = await readRSOParameters();
  await loadUserQuery();
}

async function loadUserQuery() {
  await drawTLEs(
    Cesium.JulianDate.fromIso8601(
      moment(window.initialTimeWindow).toISOString(),
    ),
  );
  await drawQuery(queryType);
}

async function drawCurrTimeTLEs() {
  lastTlesCZMLUpdatedTime = viewer.clock.currentTime;
  drawTLEs(viewer.clock.currentTime);
}

async function readRSOParameters() {
  let RSOParameterResponse = await fetch('/data/RSO_parameters.json');
  if (RSOParameterResponse.status != 200) {
    throw new Error('Server Error');
  }
  // read response stream as text
  return await RSOParameterResponse.json();
}
async function drawTLEs(initialTimeWindow) {
  lastTlesCZMLUpdatedTime = initialTimeWindow;

  let response = await fetch('/data/latest_all_LEO.tle');
  if (response.status != 200) {
    throw new Error('Server Error');
  }
  // read response stream as text
  let textData = await response.text();

  let tleCZML = await tle2czml(
    textData,
    initialTimeWindow,
    RSOParameterResponseData,
    duration,
  );
  await loadCZML(tleCZML, tlesDataSource);
}

async function document2czml(startTime, duration) {
  startTime = moment(
    Cesium.JulianDate.toIso8601(startTime, 4),
    'YYYY-MM-DDTHH:mm:ss.SSSSZ',
  ).toISOString();
  let endTime = moment(startTime, 'YYYY-MM-DDTHH:mm:ss.SSSSZ')
    .clone()
    .add(duration, 's')
    .toISOString();
  let documentCZML = {
    id: 'document',
    // name: 'CZML Point - Time Dynamic',
    version: '1.0',
    clock: {
      currentTime: `${startTime}`,
      interval: `${startTime}/${endTime}`,
      multiplier: 1,
      range: 'UNBOUNDED',
      step: 'SYSTEM_CLOCK_MULTIPLIER',
    },
  };
  return documentCZML;
}

async function tle2czml(tles, currentTime, RSOParameterResponseData, duration) {
  let tlesArray = tles.split('\r\n');
  let totalCZML = [];
  totalCZML.push(await document2czml(currentTime, duration));
  let eachTLE = [];
  // tlesArray.forEach(async function (tle, i) {
  let i = 0;
  for (let tle of tlesArray) {
    if (i % 3 == 0) {
      //first line
      eachTLE.push(tle);
    } else if (i % 3 == 1) {
      //second line
      eachTLE.push(tle);
    } else {
      //third line
      eachTLE.push(tle);
      let satrec = satellite.twoline2satrec(eachTLE[1], eachTLE[2]);
      let satName = eachTLE[0];
      let satID = satrec.satnum.split(' ').join('');
      satID = satID.replace(/(^0+)/, '');
      let RSOParameter = RSOParameterResponseData[satID];
      try {
        let RSOType = RSOParameter[0].OBJECT_TYPE;
        let countryCode = RSOParameter[0].COUNTRY_CODE;

        let currCZML = await satrec2czml(
          satrec,
          satName,
          currentTime,
          duration,
          RSOType,
          countryCode,
        );
        if (currCZML != null) {
          totalCZML.push(currCZML);
        }
      } catch (error) {
        // console.log(error);
      }

      eachTLE = [];
    }
    i += 1;
  }
  return totalCZML;
}

async function satrec2czml(
  satrec,
  satName,
  startTime,
  duration,
  RSOType,
  countryCode,
) {
  startTime = moment(
    Cesium.JulianDate.toIso8601(startTime, 4),
    'YYYY-MM-DDTHH:mm:ss.SSSSZ',
  ).toISOString();
  let endTime = moment(startTime, 'YYYY-MM-DDTHH:mm:ss.SSSSZ')
    .clone()
    .add(duration, 's')
    .toISOString();

  let res = []; //result for position
  let initTime = new Date(startTime);
  for (let i = 0; i <= duration; i += intervalUnitTime) {
    //iterates every second (86400sec in 1day)
    let positionAndVelocity = satellite.propagate(satrec, initTime); // 0.0166667min = 1sec
    initTime.setSeconds(initTime.getSeconds() + intervalUnitTime);
    let positionEci = positionAndVelocity.position;
    try {
      positionEci.x = positionEci.x * 1000;
      positionEci.y = positionEci.y * 1000;
      positionEci.z = positionEci.z * 1000;
    } catch (err) {
      return null;
    }

    res.push(i, positionEci.x, positionEci.y, positionEci.z);
  }

  let satID = satrec.satnum.split(' ').join('');

  let rgba = [];
  if (RSOType == 'PAYLOAD') {
    rgba = [0, 255, 0, 255];
  } else if (RSOType == 'ROCKET BODY') {
    rgba = [226, 66, 5, 255];
  } else if (RSOType == 'DEBRIS') {
    rgba = [200, 16, 46, 255];
  } else if (RSOType == 'TBA') {
    rgba = [120, 120, 120, 255];
  } else {
    rgba = [120, 120, 120, 255];
  }

  // console.log(rgba);
  satName = satName.replace(/(^0+)/, '');
  let initialCZMLProps = {
    id: `${satID}`,
    name: `${satName} / ${satID}`,
    availability: `${startTime}/${endTime}`,
    description: `Orbit of Satellite: ${satName} / ${satID} / ${RSOType} / ${countryCode}`,
    point: {
      show: true,
      color: {
        rgba: [255, 255, 255, 255],
      },
      outlineColor: {
        rgba: [rgba[0], rgba[1], rgba[2], rgba[3]],
      },
      outlineWidth: 0.3,
      // pixelSize: pixelSize,
      scaleByDistance: { nearFarScalar: [8400000.0, 1.2, 27720000.0, 0.8] },
      translucencyByDistance: {
        nearFarScalar: [27720000.0, 1.0, 3600000000.0, 0.3],
      },
    },
    // model: {
    //   show: true,
    //   minimumPixelSize: 350,
    // },
    position: {
      interpolationAlgorithm: 'LAGRANGE',
      forwardExtrapolationType: 'EXTRAPOLATE',
      forwardExtrapolationDuration: 0,
      backwardExtrapolationType: 'EXTRAPOLATE',
      backwardExtrapolationDuration: 0,
      interpolationDegree: 5,
      referenceFrame: 'INERTIAL',
      epoch: `${startTime}`,
      cartesian: res,
    },
  };

  return initialCZMLProps;
}

async function satrec2czmlWithPath(
  satrec,
  satName,
  initialTime,
  startTime,
  endTime,
  RSOType,
  countryCode,
) {
  initialTime = moment(initialTime).toISOString();
  startTime = moment(initialTime).add(startTime, 's').toISOString();
  endTime = moment(initialTime).add(duration, 's').toISOString();

  let totalIntervalsInDay = satrec.no * 1440 * 0.15915494327; //1440 = min && 0.159155 = 1turn
  let minsPerInterval = 1440 / totalIntervalsInDay; // mins for 1 revolution around earth
  // startTime = moment(
  //   Cesium.JulianDate.toIso8601(startTime, 4),
  //   "YYYY-MM-DDTHH:mm:ss.SSSSZ"
  // ).toISOString();

  let res = []; //result for position
  let initTime = new Date(initialTime);
  for (let i = 0; i <= duration; i += intervalUnitTime) {
    //iterates every second (86400sec in 1day)
    let positionAndVelocity = satellite.propagate(satrec, initTime); // 0.0166667min = 1sec
    initTime.setSeconds(initTime.getSeconds() + intervalUnitTime);
    let positionEci = positionAndVelocity.position;
    try {
      positionEci.x = positionEci.x * 1000;
      positionEci.y = positionEci.y * 1000;
      positionEci.z = positionEci.z * 1000;
    } catch (err) {
      return null;
    }

    res.push(i, positionEci.x, positionEci.y, positionEci.z);
  }

  let satID = satrec.satnum.split(' ').join('');

  let rgba = [138, 0, 250, 255];
  // if (RSOType == "PAYLOAD") {
  //   rgba = [0, 255, 0, 255];
  // } else if (RSOType == "ROCKET BODY") {
  //   rgba = [226, 66, 5, 255];
  // } else if (RSOType == "DEBRIS") {
  //   rgba = [200, 16, 46, 255];
  // } else if (RSOType == "TBA") {
  //   rgba = [120, 120, 120, 255];
  // } else {
  //   rgba = [120, 120, 120, 255];
  // }

  // console.log(rgba);
  satName = satName.replace(/(^0+)/, '');
  let currCZML = {
    id: `${satID}_NN`,
    name: `${satName} / ${satID}`,
    availability: `${initialTime}/${endTime}`,
    description: `Orbit of Satellite: ${satName} / ${satID} / ${RSOType} / ${countryCode}`,
    label: {
      fillColor: {
        rgba: [255, 255, 255, 255],
      },
      font: '10pt Roboto',
      horizontalOrigin: 'LEFT',
      outlineColor: {
        rgba: rgba,
      },
      outlineWidth: 2,
      pixelOffset: {
        cartesian2: [15, 15],
      },
      show: true,
      style: 'FILL_AND_OUTLINE',
      text: `${satName} ${satID}`,
      verticalOrigin: 'CENTER',
    },
    point: {
      show: true,
      color: {
        rgba: [255, 255, 255, 255],
      },
      outlineColor: {
        rgba: [rgba[0], rgba[1], rgba[2], rgba[3]],
      },
      outlineWidth: 0.3,
      // pixelSize: pixelSize,
      scaleByDistance: { nearFarScalar: [8400000.0, 1.2, 27720000.0, 0.8] },
      translucencyByDistance: {
        nearFarScalar: [27720000.0, 1.0, 3600000000.0, 0.3],
      },
    },
    // model: {
    //   show: true,
    //   minimumPixelSize: 350,
    // },
    position: {
      interpolationAlgorithm: 'LAGRANGE',
      forwardExtrapolationType: 'EXTRAPOLATE',
      forwardExtrapolationDuration: 0,
      backwardExtrapolationType: 'EXTRAPOLATE',
      backwardExtrapolationDuration: 0,
      interpolationDegree: 5,
      referenceFrame: 'INERTIAL',
      epoch: `${initialTime}`,
      cartesian: res,
    },
    path: {
      show: [
        {
          interval: `${initialTime}/${endTime}`,
          boolean: true,
        },
      ],
      width: 3,
      material: {
        polylineOutline: {
          color: {
            rgba: rgba,
          },
          outlineColor: {
            rgba: [255, 255, 255, 255],
          },
          outlineWidth: 1.5,
        },
      },
      resolution: 30,
      leadTime: minsPerInterval * 30,
      trailTime: minsPerInterval * 30,
    },
  };

  return currCZML;
}

async function loadCZML(CZML, dataSource) {
  let multiplier = viewer.clock._multiplier;
  dataSource.process(CZML).then(function (ds) {
    console.log(ds);
    let resetTime = ds.clock.currentTime;
    viewer.clockViewModel.currentTime = resetTime;
    viewer.timeline.updateFromClock();
    console.log(resetTime);
    viewer.clock._multiplier = multiplier;
    console.log(viewer.dataSources);
  });
}

/////////////////////////////////////////
// axios.get('/api/tle2czml', {}).then((response) => {
//   viewer.dataSources.add(tlesDataSource).then(function () {
//     tlesDataSource.load(response.data).then(function (ds) {
//       console.log(response.data);
//       console.log(ds);
//     });
//   });
// });

var showPayloads = document.getElementById('showPayloads');
showPayloads.onchange = function () {
  if (showPayloads.checked) {
    tlesDataSource.show = true;
  } else {
    tlesDataSource.show = false;
  }
  scene.requestRender();
};

async function drawQuery(queryType) {
  console.log('drawQuery');
  console.log(queryType);
  if (queryType == 'NN') {
    //////// OLD
    // axios
    //   .get("/api/userQuery/nndb2czml", {
    //     params: {
    //       userID: userID,
    //       userKey: userKey,
    //     },
    //   })
    //   .then((response) => {
    //     userdbDataSource.load(response.data).then(function (ds) {
    //       console.log(response.data);
    //       console.log(ds);
    //       let resetTime = ds.clock.currentTime;
    //       viewer.clockViewModel.currentTime = resetTime;
    //       console.log(resetTime);
    //       viewer.timeline.updateFromClock();
    //       viewer.flyTo(target);
    //       scene.requestRender();
    //     });
    //   });
    //////// NEW
    let response = await axios.get('/api/userQuery/nndb', {
      params: {
        userID: userID,
        userKey: userKey,
      },
    });

    let pairCZML = await nndb2czml(response.data);
    tlesDataSource.process(pairCZML);

    var resetTime = Cesium.JulianDate.fromIso8601(
      moment(window.initialTimeWindow)
        .add(response.data.startTime, 's')
        .toISOString(),
    );
    viewer.clockViewModel.currentTime = resetTime;
    viewer.timeline.updateFromClock();

    viewer.flyTo(tlesDataSource.entities.getById(response.data.targetID));
  } else if (queryType == 'TI') {
    let response = await axios.get('/api/userQuery/phdb', {
      params: {
        userID: userID,
        userKey: userKey,
      },
    });
    let pairCZML = await phdb2czml(userID, userKey, response.data);
    tlesDataSource.process(pairCZML);
    console.log(pairCZML);
    let trajResponse = await axios.get('/api/userQuery/trajCZML', {
      params: {
        userID: userID,
        userKey: userKey,
        trajFilePath: response.data.trajFilePath,
      },
    });

    tlesDataSource.process(trajResponse.data);
    console.log(trajResponse.data);
  }
}

async function nndb2czml(nndb) {
  let targetID = nndb.targetID;
  let targetTLE = await axios.get('api/tle', {
    params: {
      catalogID: targetID,
    },
  });
  // let target = tlesDataSource.entities.getById(targetID);
  console.log(nndb);
  // console.log(nndb.targetID);
  // console.log(targetTLE.data[0]);
  let satName = targetTLE.data[0].title_tle_line;
  let firstLine = targetTLE.data[0].first_tle_line;
  let secondLine = targetTLE.data[0].second_tle_line;
  let satrec = satellite.twoline2satrec(firstLine, secondLine);
  let RSOParameter = RSOParameterResponseData[targetID];
  let RSOType = RSOParameter[0].OBJECT_TYPE;
  let countryCode = RSOParameter[0].COUNTRY_CODE;
  let currCZML = await satrec2czmlWithPath(
    satrec,
    satName,
    moment(window.initialTimeWindow).toISOString(),
    nndb.startTime,
    nndb.endTime,
    RSOType,
    countryCode,
  );
  tlesDataSource.process(currCZML);

  let pairs = nndb.pairs;
  let exist_pair = [];
  let totalCZML = [];
  for (let index = 0; index < pairs.length; index++) {
    let pairCZML;
    if (exist_pair[pairs[index].secondaryID] === undefined) {
      pairCZML = pairSat2czml(
        Number(pairs[index].primaryID),
        Number(pairs[index].secondaryID),
        moment(window.initialTimeWindow).toISOString(),
        pairs[index].TCATarget,
        pairs[index].TCAStart,
        pairs[index].TCAEnd,
      );

      totalCZML.push(pairCZML);
      exist_pair[pairs[index].secondaryID] = pairCZML;
    } else {
      updateInterval4CZML(
        exist_pair[pairs[index].secondaryID],
        moment(window.initialTimeWindow).toISOString(),
        pairs[index].TCATarget,
        pairs[index].TCAStart,
        pairs[index].TCAEnd,
      );
    }
  }
  return totalCZML;
}

async function phdb2czml(userID, userKey, phdb) {
  console.log(phdb);

  let pairs = phdb.pairs;
  let exist_pair = [];
  let totalCZML = [];
  for (let index = 0; index < pairs.length; index++) {
    let pairCZML;
    if (exist_pair[pairs[index].secondaryID] === undefined) {
      pairCZML = pairSat2czml(
        `${userID}_${userKey}`,
        Number(pairs[index].secondaryID),
        moment(window.initialTimeWindow).toISOString(),
        pairs[index].TCATarget,
        pairs[index].TCAStart,
        pairs[index].TCAEnd,
      );

      totalCZML.push(pairCZML);
      exist_pair[pairs[index].secondaryID] = pairCZML;
    } else {
      updateInterval4CZML(
        exist_pair[pairs[index].secondaryID],
        moment(window.initialTimeWindow).toISOString(),
        pairs[index].TCATarget,
        pairs[index].TCAStart,
        pairs[index].TCAEnd,
      );
    }
  }
  return totalCZML;
}

function pairSat2czml(
  primary_sat_ID,
  secondary_sat_ID,
  initialTime,
  TCATarget,
  TCAStart,
  TCAEnd,
) {
  initialTime = moment(initialTime).toISOString(); //start date of TLE
  // primary_sat_ID = Number(primary_sat_ID);
  // secondary_sat_ID = Number(secondary_sat_ID);

  let startAvail = moment(initialTime).add(TCAStart, 's').toISOString();
  let tcaAvail = moment(initialTime).add(TCATarget, 's').toISOString();
  let endAvail = moment(initialTime).add(TCAEnd, 's').toISOString();

  let pairCZML = {
    id: `${primary_sat_ID}/${secondary_sat_ID}`,
    name: `${primary_sat_ID} to ${secondary_sat_ID}`,
    availability: [`${startAvail}/${endAvail}`],
    polyline: {
      show: true,
      width: 5,
      material: {
        polylineOutline: {
          color: [
            {
              interval: `${startAvail}/${tcaAvail}`,
              rgba: closeColor,
            },
            {
              interval: `${tcaAvail}/${endAvail}`,
              rgba: apartColor,
            },
          ],
          outlineColor: {
            rgba: [255, 255, 255, 255],
          },
          outlineWidth: 2,
        },
      },
      arcType: 'NONE',
      positions: {
        references: [
          `${primary_sat_ID}#position`,
          `${secondary_sat_ID}#position`,
        ],
      },
    },
  };

  return pairCZML;
}

function updateInterval4CZML(czml, initialTime, TCATarget, TCAStart, TCAEnd) {
  initialTime = moment(initialTime).toISOString(); //start date of TLE

  let startAvail = moment(initialTime).add(TCAStart, 's').toISOString();
  let tcaAvail = moment(initialTime).add(TCATarget, 's').toISOString();
  let endAvail = moment(initialTime).add(TCAEnd, 's').toISOString();

  czml.availability.push(`${startAvail}/${endAvail}`);
  czml.polyline.material.polylineOutline.color.push({
    interval: `${startAvail}/${tcaAvail}`,
    rgba: closeColor,
  });
  czml.polyline.material.polylineOutline.color.push({
    interval: `${tcaAvail}/${endAvail}`,
    rgba: apartColor,
  });
}

function assessConjunctions(dbID, value) {
  scene.requestRender();
  value = value.split(',');
  let primaryID = value[0];
  let secondaryID = value[1];
  let TCA = value[2];

  let startTime = Number(TCA).toFixed(0);
  let intervalTime = 600;
  let endTime = (Number(TCA) + intervalTime).toFixed(0);
  let liveKNN = document.getElementById('livekNN_div');
  liveKNN.style.display = 'block';
  let primaryRadio = document.getElementById('liveKNN_primary');
  let primaryRadioLabel = document.getElementById('liveKNN_primary_label');
  primaryRadio.value = primaryID;
  primaryRadioLabel.innerHTML = primaryID;
  primaryRadio.checked = false;
  let secondaryRadio = document.getElementById('liveKNN_secondary');
  let secondaryRadioLabel = document.getElementById('liveKNN_secondary_label');
  secondaryRadio.value = secondaryID;
  secondaryRadioLabel.innerHTML = secondaryID;
  secondaryRadio.checked = false;
  let live_kNN_start_time = document.getElementById('live_kNN_start_time');
  let live_kNN_end_time = document.getElementById('live_kNN_end_time');
  live_kNN_start_time.value = String(startTime);
  live_kNN_end_time.value = String(endTime);
  axios
    .get('/api/ppdb2czml', {
      params: {
        dbID: dbID,
        primaryID: primaryID,
        secondaryID: secondaryID,
      },
    })
    .then((response) => {
      ppdbDataSource.load(response.data).then(function (ds) {
        var resetTime = ds.clock.currentTime;
        console.log(response.data);
        viewer.clockViewModel.currentTime = resetTime;
        viewer.timeline.updateFromClock();
        viewer.flyTo(ppdbDataSource);
      });
    });
}

function predict_watchers_temp(data, threshold, cameraAngle, userID) {
  scene.requestRender();
  // let position = Cesium.Cartesian3.fromDegrees(127.22014245469549, 36.30871326575601);
  // // 11-10, 13:00
  // let now = Cesium.JulianDate.fromIso8601("2021-11-10T13:00:00Z");

  // // let check = Cesium.JulianDate.toDate(now);
  // // console.log(now);
  // // console.log(check);
  // let fixedToIcrf = Cesium.Transforms.computeFixedToIcrfMatrix(now);
  // let pointInInertial = new Cesium.Cartesian3();
  // if (Cesium.defined(fixedToIcrf)) {
  //   pointInInertial = Cesium.Matrix3.multiplyByVector(fixedToIcrf, position, pointInInertial);
  // }
  // console.log(pointInInertial);
  axios
    .post('/api/wcdb2czml', {
      data,
      threshold,
      cameraAngle,
      userID,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => {
      wcdbDataSource.load(response.data).then(function (ds) {
        console.log(response.data);
        console.log(ds);
        var resetTime = ds.clock.currentTime;
        viewer.clockViewModel.currentTime = resetTime;
        viewer.timeline.updateFromClock();
      });
    });
}

function predict_watchers(
  latitude,
  longitude,
  start_time,
  end_time,
  time_increment,
  threshold,
  cameraAngle,
  userID,
) {
  scene.requestRender();
  // let height = 0.0;
  // let cartographic = Cesium.Cartographic.fromDegrees(WC_longitude, WC_latitude, 6378137);
  let position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
  let x = position.x;
  let y = position.y;
  let z = position.z;
  console.log(position);
  axios
    .post('/api/wcdb2czml', {
      params: {
        x,
        y,
        z,
        start_time,
        end_time,
        time_increment,
        threshold,
        cameraAngle,
        userID,
      },
    })
    .then((response) => {
      console.log(response.data);
      phdbDataSource.load(response.data).then(function (ds) {
        console.log(response.data);
        console.log(ds);
        var resetTime = ds.clock.currentTime;
        viewer.clockViewModel.currentTime = resetTime;
        viewer.timeline.updateFromClock();
      });
    });
}

function calculate_ISLOpt(src_city, dest_city, start_time, end_time) {
  scene.requestRender();
  axios
    .get('/api/isl_opt', {
      params: {
        src_city,
        dest_city,
        start_time,
        end_time,
      },
    })
    .then((response) => {
      console.log('?');
      isloptDataSource
        .load(`./script/${response.data}.czml`)
        .then(function (ds) {
          console.log(response.data);
          let cesium_Date = Cesium.JulianDate.fromIso8601(`${start_time}Z`);
          viewer.clockViewModel.currentTime = cesium_Date;
          viewer.timeline.updateFromClock();
          viewer.flyTo(target);
        });
    });
}

function move_to_TCA(target_time, secondaryID) {
  scene.requestRender();
  let cesium_Date = Cesium.JulianDate.fromDate(target_time);
  viewer.clockViewModel.currentTime = cesium_Date;
  viewer.timeline.updateFromClock();
  let target = tlesDataSource.entities.getById(secondaryID);
  viewer.flyTo(target);
}

window.assessConjunctions = assessConjunctions;

window.predict_watchers = predict_watchers;
window.predict_watchers_temp = predict_watchers_temp;

window.move_to_TCA = move_to_TCA;

window.calculate_ISLOpt = calculate_ISLOpt;
