import React, { useCallback, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  geoNaturalEarth1,
  geoPath,
  geoGraticule,
  geoDistance
} from 'd3';
import { useData } from './useData';
import { useWorldAtlas } from './useWorldAtlas';

const width = 1024;
const height = 512;

const earthRadius = 6371;

// https://www.bbc.com/news/science-environment-49349566
// 133g/km for domestic flight, 102g/km for long haul flight
const emissionsPerKm = (133 + 102) / 2;

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

const App = () => {
  const airports = useData();
  const worldAtlas = useWorldAtlas();

  const routesRef = useRef();
  const [routes, setRoutes] = useState([]);
  const [emissions, setEmissions] = useState('-');

  const handleSubmit = useCallback(_ => {
    const totalKm = routesRef.current.value.split('\n').map((route) => {
      const [src, dst] = route.split('-');
      const dist = geoDistance(airports[src], airports[dst]) * earthRadius;
      return dist;
    }).reduce((total, curr) => total + curr);
    setEmissions(totalKm * emissionsPerKm);

    setRoutes(routesRef.current.value.split('\n').map((route) => {
      const [src, dst] = route.split('-');
      return [airports[src], airports[dst]];
    }));
  });

  if (!airports || !worldAtlas) {
    return <pre>Loading...</pre>;
  }

  return (
    <>
      <div>
        Enter routes among between airpots in IATA 3-letter code:<br />
        <textarea ref={routesRef} placeholder='HND-SFO\nSFO-JFK' /><br />
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
          {routes.map(([src, dst]) => {
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
            d={path({ type: "MultiLineString", coordinates: routes })}
          />
        </g>
      </svg>
    </>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);