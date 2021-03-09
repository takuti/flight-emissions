import React, { useCallback, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  geoNaturalEarth1,
  geoPath,
  geoGraticule,
  geoDistance
} from 'd3';
import { useAirports } from './useAirports';
import { useWorldAtlas } from './useWorldAtlas';

const width = 1024;
const height = 512;

const routeRegex = /^[A-Z]{3}-[A-Z]{3}$/;

const earthRadius = 6371;

// https://www.bbc.com/news/science-environment-49349566
// 133g/km for domestic flight, 102g/km for long haul flight
const emissionsPerKm = (133 + 102) / 2;

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

const App = () => {
  const airports = useAirports();
  const worldAtlas = useWorldAtlas();

  const inputRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const [emissions, setEmissions] = useState('-');

  const handleSubmit = useCallback(_ => {
    const coords = [];
    const totalKm = inputRef.current.value.split('\n').map((route) => {
      if (!route.match(routeRegex)) return 0;

      const [src, dst] = route.split('-');
      coords.push([airports[src], airports[dst]]);
      return geoDistance(airports[src], airports[dst]) * earthRadius;
    }).reduce((total, curr) => total + curr);

    setEmissions(totalKm * emissionsPerKm);
    setCoordinates(coords);
  });

  if (!airports || !worldAtlas) {
    return <pre>Loading...</pre>;
  }

  return (
    <>
      <div>
        Enter routes among airpots in IATA 3-letter code:<br />
        <textarea ref={inputRef} placeholder='HND-SFO\nSFO-JFK' rows={10} /><br />
        <button onClick={handleSubmit}>Calculate CO2 Emissions</button>
        <p>Total CO2 emissions: {emissions}g</p>
      </div>
      <svg width={width} height={height}>
        <g className="marks">
          <path className="sphere" d={path({ type: 'Sphere' })} />
          <path className="graticule" d={path(graticule())} />
          {worldAtlas.land.features.map((feature) => (
            <path className="land" d={path(feature)} />
          ))}
          <path className="interiors" d={path(worldAtlas.interiors)} />
          {coordinates.map(([src, dst]) => {
            const [x1, y1] = projection(src);
            const [x2, y2] = projection(dst);
            return (
              <>
                <circle cx={x1} cy={y1} r={4} />
                <circle cx={x2} cy={y2} r={4} />
              </>
            );
          })}
          <path
            className="route"
            d={path({ type: "MultiLineString", coordinates: coordinates })}
          />
        </g>
      </svg>
    </>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);