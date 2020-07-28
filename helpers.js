exports.createDateTime = (t) => {
  var date = new Date(t * 1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  var formattedTime =
    hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

  return formattedTime;
};

/**
 *
 * @param {*} t = temp in C
 * @param {*} rh = relative humidity
 */
exports.calculateDewPoint = (t, rh) => {
  return (
    (243.04 * (Math.log(rh / 100) + (17.625 * t) / (243.04 + t))) /
    (17.625 - Math.log(rh / 100) - (17.625 * t) / (243.04 + t))
  );
};

/**
 *
 * @param {*} t = temp C
 * @param {*} rh = relative humidity
 * @param {*} ws = wind speed MPH
 */
exports.calculateFeelsLikeTemp = (t, rh, ws) => {
  ws = ws * 2.237;
  if (t >= 26.6667 && rh >= 40) {
    t = exports.covertToFahrenheit(t);
    return (
      -42.379 +
      2.04901523 * t +
      10.1433127 * rh -
      0.22475541 * t * rh -
      6.83783 * Math.pow(10, -3) * Math.pow(t, 2) -
      5.481717 * Math.pow(10, -2) * Math.pow(rh, 2) +
      1.22874 * Math.pow(10, -3) * Math.pow(t, 2) * rh +
      8.5282 * Math.pow(10, -4) * t * Math.pow(rh, 2) -
      1.99 * Math.pow(10, -6) * Math.pow(t, 2) * Math.pow(rh, 2)
    );
  }

  if (t <= 10 && ws >= 3) {
    t = exports.covertToFahrenheit(t);
    return (
      35.74 + 0.6215 * t - ((35.75 * ws) ^ 0.16) + ((0.4275 * t * ws) ^ 0.16)
    );
  }

  return t; //celsius
};

/**
 *
 * @param {*} t = temp in C
 */
exports.covertToFahrenheit = (t) => {
  return (t * 9) / 5 + 32;
};

/**
 *
 * @param {*} ws = wind speed in MPS
 */

exports.convertToMPH = (ws) => {
  return ws * 2.237;
};
