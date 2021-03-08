import React, { useCallback, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { geoDistance } from 'd3';
import { useData } from './useData';

const earthRadius = 6371;

// https://www.bbc.com/news/science-environment-49349566
// 133g/km for domestic flight, 102g/km for long haul flight
const emissionsPerKm = (133 + 102) / 2;

const App = () => {
  const airports = useData();

  const routesRef = useRef();
  const [emissions, setEmissions] = useState('-');

  const handleSubmit = useCallback(_ => {
    const totalKm = routesRef.current.value.split('\n').map((route) => {
      const [src, dst] = route.split('-');
      const dist = geoDistance(airports[src], airports[dst]) * earthRadius;
      return dist;
    }).reduce((total, curr) => total + curr);
    setEmissions(totalKm * emissionsPerKm);
  });

  if (!airports) {
    return <pre>Loading...</pre>;
  }

  return (
    <div>
      Enter routes among between airpots in IATA 3-letter code:<br />
      <textarea ref={routesRef} placeholder='HND-SFO\nSFO-JFK' /><br />
      <button onClick={handleSubmit}>Calculate CO2 Emissions</button>
      <p>Total CO2 emissions: {emissions}g</p>
    </div>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);