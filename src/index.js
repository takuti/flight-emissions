import React from 'react';
import ReactDOM from 'react-dom';
import { geoDistance } from 'd3';
import { useData } from './useData';

const earthRadius = 6371;

const App = () => {
  const airports = useData();

  if (!airports) {
    return <pre>Loading...</pre>;
  }

  console.log(airports);

  return (
    <div>
      <p>Read {Object.keys(airports).length} airports.</p>
      <p>Distance between HND ({airports.HND.join(', ')}) and SFO ({airports.SFO.join(', ')}) is: {geoDistance(airports.HND, airports.SFO) * earthRadius}km</p>
    </div>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);