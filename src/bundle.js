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

  var App = function () {
    var airports = useData();

    if (!airports) {
      return React__default['default'].createElement( 'pre', null, "Loading..." );
    }

    console.log(airports);

    return (
      React__default['default'].createElement( 'div', null,
        React__default['default'].createElement( 'p', null, "Read ", Object.keys(airports).length, " airports." ),
        React__default['default'].createElement( 'p', null, "Distance between HND (", airports.HND.join(', '), ") and SFO (", airports.SFO.join(', '), ") is: ", d3.geoDistance(airports.HND, airports.SFO) * earthRadius, "km" )
      )
    );
  };

  var rootElement = document.getElementById('root');
  ReactDOM__default['default'].render(React__default['default'].createElement( App, null ), rootElement);

}(React, ReactDOM, d3));
