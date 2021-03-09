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
          interiors: topojson.mesh(topology, countries, function (a, b) { return a !== b; })
        });
      });
    }, []);
    
    return data;
  };

  var width = 1024;
  var height = 512;

  var earthRadius = 6371;

  // https://www.bbc.com/news/science-environment-49349566
  // 133g/km for domestic flight, 102g/km for long haul flight
  var emissionsPerKm = (133 + 102) / 2;

  var projection = d3.geoNaturalEarth1();
  var path = d3.geoPath(projection);
  var graticule = d3.geoGraticule();

  var App = function () {
    var airports = useAirports();
    var worldAtlas = useWorldAtlas();

    var inputRef = React.useRef();
    var ref = React.useState([]);
    var coordinates = ref[0];
    var setCoordinates = ref[1];
    var ref$1 = React.useState('-');
    var emissions = ref$1[0];
    var setEmissions = ref$1[1];

    var handleSubmit = React.useCallback(function (_) {
      var coords = [];

      var totalKm = inputRef.current.value.split('\n').map(function (route) {
        var ref = route.split('-');
        var src = ref[0];
        var dst = ref[1];
        coords.push([airports[src], airports[dst]]);
        return d3.geoDistance(airports[src], airports[dst]) * earthRadius;
      }).reduce(function (total, curr) { return total + curr; });

      setEmissions(totalKm * emissionsPerKm);
      setCoordinates(coords);
    });

    if (!airports || !worldAtlas) {
      return React__default['default'].createElement( 'pre', null, "Loading..." );
    }

    return (
      React__default['default'].createElement( React__default['default'].Fragment, null,
        React__default['default'].createElement( 'div', null, "Enter routes among airpots in IATA 3-letter code:", React__default['default'].createElement( 'br', null ),
          React__default['default'].createElement( 'textarea', { ref: inputRef, placeholder: 'HND-SFO\nSFO-JFK', rows: 10 }), React__default['default'].createElement( 'br', null ),
          React__default['default'].createElement( 'button', { onClick: handleSubmit }, "Calculate CO2 Emissions"),
          React__default['default'].createElement( 'p', null, "Total CO2 emissions: ", emissions, "g" )
        ),
        React__default['default'].createElement( 'svg', { width: width, height: height },
          React__default['default'].createElement( 'g', { className: "marks" },
            React__default['default'].createElement( 'path', { className: "sphere", d: path({ type: 'Sphere' }) }),
            React__default['default'].createElement( 'path', { className: "graticule", d: path(graticule()) }),
            worldAtlas.land.features.map(function (feature) { return (
              React__default['default'].createElement( 'path', { className: "land", d: path(feature) })
            ); }),
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
