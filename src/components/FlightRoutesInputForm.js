import { geoDistance } from 'd3';

const routeRegex = /^[A-Z]{3}-[A-Z]{3}$/;

const earthRadius = 6371;

// https://www.bbc.com/news/science-environment-49349566
// 133g/km for domestic flight, 102g/km for long haul flight
const emissionsPerKm = (133 + 102) / 2;

export const FlightRoutesInputForm = ({
  airports,
  inputRef,
  setEmissions,
  setCoordinates,
}) => (
  <span>
    Enter routes among airports in IATA 3-letter code:
    <br />
    <textarea
      ref={inputRef} 
      placeholder='HND-SFO\nSFO-JFK\nJFK-NRT' 
      rows={10}
    />
    <br />
    <button onClick={() => {
      const coords = [];
      const totalKm = inputRef.current.value.split('\n').map((route) => {
        if (!route.match(routeRegex)) return 0;

        const [src, dst] = route.split('-');
        coords.push([airports[src], airports[dst]]);
        return geoDistance(airports[src], airports[dst]) * earthRadius;
      }).reduce((total, curr) => total + curr);

      const emissions = totalKm * emissionsPerKm / 1000000;
      setEmissions(emissions);
      setCoordinates(coords);
    }}>
      Calculate total CO2 emissions
    </button>
  </span>
);