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
        setData(d3.csvParseRows(text).map(parseRow));
      });
    }, []);

    return data;
  };

  var App = function () {
    var data = useData();

    if (!data) {
      return React__default['default'].createElement( 'pre', null, "Loading..." );
    }

    console.log(data);

    return (
      React__default['default'].createElement( 'div', null, "Read ", data.length, " airports." )
    );
  };

  var rootElement = document.getElementById('root');
  ReactDOM__default['default'].render(React__default['default'].createElement( App, null ), rootElement);

}(React, ReactDOM, d3));
