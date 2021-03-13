(function (React, ReactDOM, d3, topojson) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
  var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);

  var textUrl = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';

  var parseRow = function (row) { return ({
    name: row[1],
    IATA: row[4],
    latitude: +row[6],
    longitude: +row[7],
  }); };

  var useAirports = function () {
    var ref = React.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React.useEffect(function () {
      d3.text(textUrl).then(function (text) {
        var airports = {};
        d3.csvParseRows(text).map(function (row) {
          var d = parseRow(row);
          if (d.IATA === "\\N") { return; }
          airports[d.IATA] = [d.longitude, d.latitude];
        });
        setData(airports);
      });
    }, []);

    return data;
  };

  var jsonUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-50m.json';

  var useWorldAtlas = function () {
    var ref = React.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React.useEffect(function () {
      d3.json(jsonUrl).then(function (topology) {
        var ref = topology.objects;
        var countries = ref.countries;
        var land = ref.land;
      	setData({
          land: topojson.feature(topology, land),
          countries: topojson.feature(topology, countries),
          interiors: topojson.mesh(topology, countries, function (a, b) { return a !== b; })
        });
      });
    }, []);
    
    return data;
  };

  var csvUrl$1 =
    'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-3/slim-3.csv';

  var useCountryCodes = function () {
    var ref = React.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React.useEffect(function () {
      d3.csv(csvUrl$1).then(setData);
    }, []);

    return data;
  };

  var csvUrl =
    'https://gist.githubusercontent.com/takuti/5f236dd5847c30de0936c598dbcbe9b2/raw/dd2d56ccf2a2ad6a7958ef4cedfc6790a8111076/co2_emissions_per_capita.csv';

  var row = function (d) {
    d.emissions = +d[
      'Per capita CO2 emissions'
    ];
    return d;
  };

  var useData = function () {
    var ref = React.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React.useEffect(function () {
      d3.csv(csvUrl, row).then(setData);
    }, []);

    return data;
  };

  var width = 1024;
  var height = 512;

  var routeRegex = /^[A-Z]{3}-[A-Z]{3}$/;

  var earthRadius = 6371;

  // https://www.bbc.com/news/science-environment-49349566
  // 133g/km for domestic flight, 102g/km for long haul flight
  var emissionsPerKm = (133 + 102) / 2;

  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  var selectedYear = '2019';
  var missingDataColor = '#d8d8d8';

  var App = function () {
    var airports = useAirports();
    var worldAtlas = useWorldAtlas();
    var countryCodes = useCountryCodes();
    var data = useData();

    var inputRef = React.useRef();
    var ref = React.useState([]);
    var coordinates = ref[0];
    var setCoordinates = ref[1];
    var ref$1 = React.useState(0);
    var emissions = ref$1[0];
    var setEmissions = ref$1[1];

    var handleSubmit = React.useCallback(function (_) {
      var coords = [];
      var totalKm = inputRef.current.value.split('\n').map(function (route) {
        if (!route.match(routeRegex)) { return 0; }

        var ref = route.split('-');
        var src = ref[0];
        var dst = ref[1];
        coords.push([airports[src], airports[dst]]);
        return d3.geoDistance(airports[src], airports[dst]) * earthRadius;
      }).reduce(function (total, curr) { return total + curr; });

      var emissions = totalKm * emissionsPerKm / 1000000;
      setEmissions(emissions);
      setCoordinates(coords);
    });

    if (!airports || !worldAtlas || !countryCodes || !data) {
      return React__default['default'].createElement( 'pre', null, "Loading..." );
    }

    var numericCodeByAlpha3Code = new Map();
    countryCodes.forEach(function (code) {
      numericCodeByAlpha3Code.set(
        code['alpha-3'],
        code['country-code']
      );
    });

    var filteredData = data.filter(
      function (d) { return d.Year === selectedYear; }
    );

    var rowByNumericCode = new Map();
    filteredData.forEach(function (d) {
      var alpha3Code = d.Code;
      var numericCode = numericCodeByAlpha3Code.get(
        alpha3Code
      );
      rowByNumericCode.set(numericCode, d);
    });

    var colorValue = function (d) { return d.emissions; };

    var colorScale = d3.scaleSequential(
      d3.interpolateOrRd
    ).domain([0, d3.max(filteredData, colorValue)]);

    return (
      React__default['default'].createElement( React__default['default'].Fragment, null,
        React__default['default'].createElement( 'div', null, "Enter routes among airpots in IATA 3-letter code:", React__default['default'].createElement( 'br', null ),
          React__default['default'].createElement( 'textarea', { ref: inputRef, placeholder: 'HND-SFO\nSFO-JFK', rows: 10 }), React__default['default'].createElement( 'br', null ),
          React__default['default'].createElement( 'button', { onClick: handleSubmit }, "Calculate CO2 Emissions"),
          React__default['default'].createElement( 'p', null, "Total CO2 emissions: ", emissions, " tonnes" ),
          React__default['default'].createElement( 'p', null, "Global average of yearly emissions per capita: ", rowByNumericCode.get(undefined).emissions, " tonnes" )
        ),
        React__default['default'].createElement( 'svg', { width: width, height: height },
          React__default['default'].createElement( 'g', { className: "marks" },
            React__default['default'].createElement( 'path', { className: "sphere", d: path({ type: 'Sphere' }) }),
            worldAtlas.countries.features.map(function (feature) {
              var d = rowByNumericCode.get(feature.id);
              return (
                React__default['default'].createElement( 'path', {
                  className: "countries", fill: (d && d.emissions < emissions) 
                      ? colorScale(colorValue(d)) 
                      : missingDataColor, onMouseEnter: function (e) { return d3.select(e.target).attr(
                      "fill",
                      d ? colorScale(colorValue(d)) : missingDataColor
                    ); }, onMouseLeave: function (e) { return d3.select(e.target).attr(
                      "fill",
                      (d && d.emissions < emissions) 
                        ? colorScale(colorValue(d))
                        : missingDataColor
                    ); }, d: path(feature) })
              );
            }),
            React__default['default'].createElement( 'path', { className: "interiors", d: path(worldAtlas.interiors) }),
            coordinates.map(function (ref) {
              var src = ref[0];
              var dst = ref[1];

              var ref$1 = projection(src);
              var x1 = ref$1[0];
              var y1 = ref$1[1];
              var ref$2 = projection(dst);
              var x2 = ref$2[0];
              var y2 = ref$2[1];
              return (
                React__default['default'].createElement( React__default['default'].Fragment, null,
                  React__default['default'].createElement( 'circle', { cx: x1, cy: y1, r: 4 }),
                  React__default['default'].createElement( 'circle', { cx: x2, cy: y2, r: 4 })
                )
              );
            }),
            React__default['default'].createElement( 'path', {
              className: "route", d: path({ type: "MultiLineString", coordinates: coordinates }) })
          )
        )
      )
    );
  };

  var rootElement = document.getElementById('root');
  ReactDOM__default['default'].render(React__default['default'].createElement( App, null ), rootElement);

}(React, ReactDOM, d3, topojson));
