(function (React, ReactDOM, d3) {
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

  var useData = function () {
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

  var earthRadius = 6371;

  // https://www.bbc.com/news/science-environment-49349566
  // 133g/km for domestic flight, 102g/km for long haul flight
  var emissionsPerKm = (133 + 102) / 2;

  var App = function () {
    var airports = useData();

    var routesRef = React.useRef();
    var ref = React.useState('-');
    var emissions = ref[0];
    var setEmissions = ref[1];

    var handleSubmit = React.useCallback(function (_) {
      var totalKm = routesRef.current.value.split('\n').map(function (route) {
        var ref = route.split('-');
        var src = ref[0];
        var dst = ref[1];
        var dist = d3.geoDistance(airports[src], airports[dst]) * earthRadius;
        return dist;
      }).reduce(function (total, curr) { return total + curr; });
      setEmissions(totalKm * emissionsPerKm);
    });

    if (!airports) {
      return React__default['default'].createElement( 'pre', null, "Loading..." );
    }

    return (
      React__default['default'].createElement( 'div', null, "Enter routes among between airpots in IATA 3-letter code:", React__default['default'].createElement( 'br', null ),
        React__default['default'].createElement( 'textarea', { ref: routesRef, placeholder: 'HND-SFO\nSFO-JFK' }), React__default['default'].createElement( 'br', null ),
        React__default['default'].createElement( 'button', { onClick: handleSubmit }, "Calculate CO2 Emissions"),
        React__default['default'].createElement( 'p', null, "Total CO2 emissions: ", emissions, "g" )
      )
    );
  };

  var rootElement = document.getElementById('root');
  ReactDOM__default['default'].render(React__default['default'].createElement( App, null ), rootElement);

}(React, ReactDOM, d3));
