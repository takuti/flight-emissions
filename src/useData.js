import { useState, useEffect } from 'react';
import { text, csvParseRows } from 'd3';

const textUrl = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';

const parseRow = (row) => ({
  name: row[1],
  IATA: row[4],
  latitude: +row[6],
  longitude: +row[7],
});

export const useData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    text(textUrl).then((text) => {
      const airports = {};
      csvParseRows(text).map((row) => {
        const d = parseRow(row);
        if (d.IATA === "\\N") return;
        airports[d.IATA] = [d.longitude, d.latitude];
      });
      setData(airports);
    });
  }, []);

  return data;
};