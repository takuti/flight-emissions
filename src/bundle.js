(function (React$1, ReactDOM, d3, topojson) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React$1);
  var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);

  var round = function (n, d) { return (
    Math.round(n * Math.pow(10, d)) / Math.pow(10, d)
  ); };

  var textUrl = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';

  var parseRow = function (row) { return ({
    name: row[1],
    IATA: row[4],
    latitude: +row[6],
    longitude: +row[7],
  }); };

  var useAirports = function () {
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React$1.useEffect(function () {
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
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React$1.useEffect(function () {
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
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React$1.useEffect(function () {
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

  var usePerCapitaEmissions = function () {
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React$1.useEffect(function () {
      d3.csv(csvUrl, row).then(setData);
    }, []);

    return data;
  };

  var missingDataColor = '#d8d8d8';

  var WorldMap = function (ref) {
    var ref_worldAtlas = ref.worldAtlas;
    var countries = ref_worldAtlas.countries;
    var interiors = ref_worldAtlas.interiors;
    var path = ref.path;
    var rowByNumericCode = ref.rowByNumericCode;
    var emissions = ref.emissions;
    var colorValue = ref.colorValue;
    var colorScale = ref.colorScale;

    return (
    React.createElement( 'g', { className: "map" },
      React.createElement( 'path', { className: "sphere", d: path({ type: 'Sphere' }) }),
      countries.features.map(function (feature) {
        var d = rowByNumericCode.get(feature.id);
        return (
          React.createElement( 'path', {
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
              ); }, d: path(feature) },
            React.createElement( 'title', null,
              feature.properties.name, ": ", d ? round(d.emissions, 3) + ' tonnes/capita' : 'n/a'
            )
          )
        );
      }),
      React.createElement( 'path', { className: "interiors", d: path(interiors) })
    )
  );
  };

  var FlightRoutes = function (ref) {
    var path = ref.path;
    var projection = ref.projection;
    var coordinates = ref.coordinates;

    return (
    React.createElement( 'g', { className: "routes" },
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
          React.createElement( React.Fragment, null,
            React.createElement( 'circle', { cx: x1, cy: y1, r: 3 }),
            React.createElement( 'circle', { cx: x2, cy: y2, r: 3 })
          )
        );
      }),
      React.createElement( 'path', {
        className: "route", d: path({ type: "MultiLineString", coordinates: coordinates }) })
    )
  );
  };

  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  var FlightMap = function (ref) {
    var worldAtlas = ref.worldAtlas;
    var rowByNumericCode = ref.rowByNumericCode;
    var colorValue = ref.colorValue;
    var colorScale = ref.colorScale;
    var emissions = ref.emissions;
    var coordinates = ref.coordinates;

    return (
    React.createElement( React.Fragment, null,
      React.createElement( WorldMap, { 
        worldAtlas: worldAtlas, path: path, rowByNumericCode: rowByNumericCode, emissions: emissions, colorValue: colorValue, colorScale: colorScale }),
      React.createElement( FlightRoutes, { 
        path: path, projection: projection, coordinates: coordinates })
    )
  );
  };

  var routeRegex = /^[A-Z]{3}-[A-Z]{3}$/;

  var earthRadius = 6371;

  // https://www.bbc.com/news/science-environment-49349566
  // 133g/km for domestic flight, 102g/km for long haul flight
  var emissionsPerKm = (133 + 102) / 2;

  var FlightRoutesInputForm = function (ref) {
    var airports = ref.airports;
    var inputRef = ref.inputRef;
    var setEmissions = ref.setEmissions;
    var setCoordinates = ref.setCoordinates;

    return (
    React.createElement( 'span', null, "Enter routes among airpots in IATA 3-letter code: ", React.createElement( 'br', null ),
      React.createElement( 'textarea', {
        ref: inputRef, placeholder: 'HND-SFO\nSFO-JFK\nJFK-NRT', rows: 10 }),
      React.createElement( 'br', null ),
      React.createElement( 'button', { onClick: function () {
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
      } }, "Calculate total CO2 emissions")
    )
  );
  };

  var loadStyle = function () {
      var sheet = document.styleSheets[1];
    
      var styleRules = [];
      for (var i = 0; i < sheet.cssRules.length; i++)
        { styleRules.push(sheet.cssRules.item(i).cssText); }
    
      var style = document.createElement("style");
      style.type = "text/css";
      style.appendChild(document.createTextNode(styleRules.join(' ')));
    
      return style;
  };
  var style = loadStyle();
    
  var SVGDownloadButton = function (ref) {
    var width = ref.width;
    var height = ref.height;

    return (
      React.createElement( 'button', { onClick: function () {
          // fetch SVG-rendered image as a blob object
          var svg = document.querySelector('svg');
          svg.insertBefore(style, svg.firstChild); // CSS must be explicitly embedded
          var data = (new XMLSerializer()).serializeToString(svg);
          var svgBlob = new Blob([data], {
          type: 'image/svg+xml;charset=utf-8'
          });
      
          svg.removeChild(svg.childNodes[0]); // remove temporarily injected CSS
      
          // convert the blob object to a dedicated URL
          var url = URL.createObjectURL(svgBlob);
      
          // load the SVG blob to a flesh image object
          var img = new Image();
          img.addEventListener('load', function () {
          // draw the image on an ad-hoc canvas
          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
      
          var context = canvas.getContext('2d');
          context.drawImage(img, 0, 0, width, height);
      
          URL.revokeObjectURL(url);
      
          // trigger a synthetic download operation with a temporary link
          var a = document.createElement('a');
          a.download = "map.png";
          document.body.appendChild(a);
          a.href = canvas.toDataURL();
          a.click();
          a.remove();
          });
          img.src = url;
      } }, "Download")
  );
  };

  var width = 1024;
  var height = 512;

  var selectedYear = '2019';

  var App = function () {
    var airports = useAirports();
    var worldAtlas = useWorldAtlas();
    var countryCodes = useCountryCodes();
    var perCapitaEmissions = usePerCapitaEmissions();

    var inputRef = React$1.useRef();
    var ref = React$1.useState([]);
    var coordinates = ref[0];
    var setCoordinates = ref[1];
    var ref$1 = React$1.useState(0);
    var emissions = ref$1[0];
    var setEmissions = ref$1[1];

    if (!airports || !worldAtlas || !countryCodes || !perCapitaEmissions) {
      return React__default['default'].createElement( 'pre', null, "Loading..." );
    }

    var numericCodeByAlpha3Code = new Map();
    countryCodes.forEach(function (code) {
      numericCodeByAlpha3Code.set(
        code['alpha-3'],
        code['country-code']
      );
    });

    var filteredData = perCapitaEmissions.filter(
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
        React__default['default'].createElement( 'svg', { width: width, height: height },
          React__default['default'].createElement( FlightMap, { 
            worldAtlas: worldAtlas, rowByNumericCode: rowByNumericCode, colorValue: colorValue, colorScale: colorScale, emissions: emissions, coordinates: coordinates }),
          React__default['default'].createElement( 'text', { x: "10", y: height - 10, 'font-size': "small" }, "* Colored countries represent that your flight emissions exceeded their per-capita yearly emissions in ", selectedYear, ".")
        ),
        React__default['default'].createElement( 'div', null,
          React__default['default'].createElement( FlightRoutesInputForm, { 
            airports: airports, inputRef: inputRef, setEmissions: setEmissions, setCoordinates: setCoordinates }),
          React__default['default'].createElement( 'br', null ),
          React__default['default'].createElement( SVGDownloadButton, { 
            width: width, height: height }),
          React__default['default'].createElement( 'ul', null,
            React__default['default'].createElement( 'li', null, "Total CO2 emissions from your flights: ", React__default['default'].createElement( 'b', null, round(emissions, 3), " tonnes" ) ),
            React__default['default'].createElement( 'li', null, "Global average of yearly emissions per capita in ", selectedYear, ": ", React__default['default'].createElement( 'b', null, round(rowByNumericCode.get(undefined).emissions, 3), " tonnes" ), " [", React__default['default'].createElement( 'a', { href: "https://ourworldindata.org/per-capita-co2", target: "_blank" }, "source"), "]" )
          )
        )
      )
    );
  };

  var rootElement = document.getElementById('root');
  ReactDOM__default['default'].render(React__default['default'].createElement( App, null ), rootElement);

}(React, ReactDOM, d3, topojson));
