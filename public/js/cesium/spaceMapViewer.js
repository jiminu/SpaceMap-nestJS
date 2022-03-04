Cesium.Ion.defaultAccessToken =
  'token';

// Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
const payloadColor = [0, 255, 0, 255];
const debrisColor = [200, 16, 46, 255];
const apartColor = [0, 255, 128, 255];
const closeColor = [255, 0, 0, 255];
const primarySatColor = [138, 0, 250, 255];
const secondarySatColor = [255, 255, 23, 255];
const viewer = new Cesium.Viewer('cesium_api', {
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
viewer.camera.defaultZoomAmount = 100.0;
viewer.useDefaultRenderLoop = false;

function myOwnRenderLoop() {
  viewer.resize();
  viewer.render();
  Cesium.requestAnimationFrame(myOwnRenderLoop);
}

Cesium.requestAnimationFrame(myOwnRenderLoop);

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
var ppdbDataSource = new Cesium.CzmlDataSource();
viewer.dataSources.add(ppdbDataSource);

//////////////////////////////////////////

const intervalUnitTime = 600;
const duration = 172800;
let RSOParameterResponseData;
let lastTlesCZMLUpdatedTime;

async function viewerInitialize() {
  RSOParameterResponseData = await readRSOParameters();
  drawTLEs(
    Cesium.JulianDate.fromIso8601(
      moment(window.initialTimeWindow).toISOString(),
    ),
  );
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

async function document2czml(startTime, currentTime, duration) {
  // startTime = moment(
  //   Cesium.JulianDate.toIso8601(startTime, 4),
  //   'YYYY-MM-DDTHH:mm:ss.SSSSZ',
  // ).toISOString();

  // currentTime = moment(
  //   Cesium.JulianDate.toIso8601(currentTime, 4),
  //   'YYYY-MM-DDTHH:mm:ss.SSSSZ',
  // ).toISOString();

  let endTime = moment(startTime, 'YYYY-MM-DDTHH:mm:ss.SSSSZ')
    .clone()
    .add(duration, 's')
    .toISOString();
  let documentCZML = {
    id: 'document',
    // name: 'CZML Point - Time Dynamic',
    version: '1.0',
    clock: {
      currentTime: `${currentTime}`,
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
  console.log(window.initialTimeWindow);
  totalCZML.push(
    await document2czml(
      window.initialTimeWindow,
      window.initialTimeWindow,
      duration,
    ),
  );
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
          window.initialTimeWindow,
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
      scaleByDistance: { nearFarScalar: [8400000.0, 2.0, 27720000.0, 1.0] },
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
  offset,
  rgba,
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
    id: `${satID}`,
    name: `${satName} / ${satID}`,
    availability: `${initialTime}/${endTime}`,
    description: `Orbit of Satellite: ${satName} / ${satID} / ${RSOType} / ${countryCode}`,
    label: {
      fillColor: {
        rgba: [255, 255, 255, 255],
      },
      font: '14pt Roboto',
      horizontalOrigin: 'LEFT',
      outlineColor: {
        rgba: rgba,
      },
      outlineWidth: 2,
      pixelOffset: {
        cartesian2: [offset, offset],
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
        rgba: rgba,
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
    var resetTime = ds.clock.currentTime;
    viewer.clockViewModel.currentTime = resetTime;
    viewer.timeline.updateFromClock();
    viewer.clock._multiplier = multiplier;
  });
}

/////////////////////////////////////////

function move_to_TCA(target_time, secondaryID) {
  scene.requestRender();
  let cesium_Date = Cesium.JulianDate.fromDate(target_time);
  viewer.clockViewModel.currentTime = cesium_Date;
  viewer.timeline.updateFromClock();
  let target = tlesDataSource.entities.getById(secondaryID);
  viewer.flyTo(target);
}

function dataSourcesClearWithoutTLE() {
  scene.requestRender();
  ppdbDataSource.load();
}

async function assessConjunctions(dbID, value) {
  let totalCZML = [];
  value = value.split(',');
  let primaryID = value[0];
  let secondaryID = value[1];
  let TCA = value[2];

  let currPPDB = await axios.get('/ppdb/ppdbByID', {
    params: {
      dbID: dbID,
    },
  });

  let primaryTLE = await axios.get('/tle/TLEbyNoradID', {
    params: {
      noradID: primaryID,
    },
  });
  console.log(currPPDB);
  console.log(currPPDB.data);
  console.log(primaryTLE);
  let primarySatrec = await satellite.twoline2satrec(
    primaryTLE.data.first_tle_line,
    primaryTLE.data.second_tle_line,
  );
  let primarySatName = primaryTLE.data.title_tle_line;

  let secondaryTLE = await axios.get('/tle/TLEbyNoradID', {
    params: {
      noradID: secondaryID,
    },
  });

  let secondarySatrec = await satellite.twoline2satrec(
    secondaryTLE.data.first_tle_line,
    secondaryTLE.data.second_tle_line,
  );
  let secondarySatName = secondaryTLE.data.title_tle_line;
  let roundSec = currPPDB.data.sec.toFixed(0);
  let currentTime = moment(
    ''.concat(
      currPPDB.data.year,
      '-',
      currPPDB.data.mon,
      '-',
      currPPDB.data.day,
      ' ',
      currPPDB.data.hour,
      ':',
      currPPDB.data.min,
      ':',
      roundSec,
      '.00Z',
    ),
  ).toISOString();
  console.log(currentTime);
  console.log(
    currPPDB.data.year,
    '-',
    currPPDB.data.mon,
    '-',
    currPPDB.data.day,
    ' ',
    currPPDB.data.hour,
    ':',
    currPPDB.data.min,
    ':',
    roundSec,
  );
  let documentCZML = await document2czml(
    window.initialTimeWindow,
    currentTime,
    duration,
  );

  totalCZML.push(documentCZML);

  try {
    let primaryRSOParameter = RSOParameterResponseData[primaryID];
    let RSOType = primaryRSOParameter[0].OBJECT_TYPE;
    let countryCode = primaryRSOParameter[0].COUNTRY_CODE;
    let rgba = [138, 0, 250, 255];
    let currCZML = await satrec2czmlWithPath(
      primarySatrec,
      primarySatName,
      window.initialTimeWindow,
      window.initialTimeWindow,
      duration,
      RSOType,
      countryCode,
      20,
      rgba,
    );
    console.log(currCZML);
    if (currCZML != null) {
      totalCZML.push(currCZML);
    }
  } catch (error) {
    console.log(error);
  }

  try {
    let secondaryRSOParameter = RSOParameterResponseData[secondaryID];
    let RSOType = secondaryRSOParameter[0].OBJECT_TYPE;
    let countryCode = secondaryRSOParameter[0].COUNTRY_CODE;
    let rgba = [255, 255, 23, 255];
    let currCZML = await satrec2czmlWithPath(
      secondarySatrec,
      secondarySatName,
      window.initialTimeWindow,
      window.initialTimeWindow,
      duration,
      RSOType,
      countryCode,
      -40,
      rgba,
    );
    console.log(currCZML);
    if (currCZML != null) {
      totalCZML.push(currCZML);
    }
  } catch (error) {
    console.log(error);
  }

  let pairCZML = await pairSat2czml(
    primarySatrec.satnum.split(' ').join(''),
    secondarySatrec.satnum.split(' ').join(''),
    moment(window.initialTimeWindow).toISOString(),
    currPPDB.data.TCATarget,
    currPPDB.data.TCAStart,
    currPPDB.data.TCAEnd,
  );

  totalCZML.push(pairCZML);

  // ppdbDataSource.load(totalCZML).then(function (ds) {
  //   let resetTime = ds.clock.currentTime;
  //   viewer.clockViewModel.currentTime = resetTime;
  //   viewer.timeline.updateFromClock();
  //   viewer.flyTo(ppdbDataSource);
  // });
  console.log(totalCZML);
  await loadCZML(totalCZML, ppdbDataSource);
  await viewer.flyTo(ppdbDataSource);
}

function pairSat2czml(
  primaryID,
  secondaryID,
  initialTime,
  TCATarget,
  TCAStart,
  TCAEnd,
) {
  initialTime = moment(initialTime).toISOString(); //start date of TLE
  // primaryID = Number(primaryID);
  // secondaryID = Number(secondaryID);

  let startAvail = moment(initialTime).add(TCAStart, 's').toISOString();
  let tcaAvail = moment(initialTime).add(TCATarget, 's').toISOString();
  let endAvail = moment(initialTime).add(TCAEnd, 's').toISOString();

  let pairCZML = {
    id: `${primaryID}/${secondaryID}`,
    name: `${primaryID} to ${secondaryID}`,
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
        references: [`${primaryID}#position`, `${secondaryID}#position`],
      },
    },
  };

  return pairCZML;
}

window.assessConjunctions = assessConjunctions;
window.move_to_TCA = move_to_TCA;
window.dataSourcesClearWithoutTLE = dataSourcesClearWithoutTLE;
