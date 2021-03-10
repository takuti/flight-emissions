import { useState, useEffect } from 'react';
import { csv } from 'd3';

const csvUrl =
  'https://gist.githubusercontent.com/takuti/5f236dd5847c30de0936c598dbcbe9b2/raw/dd2d56ccf2a2ad6a7958ef4cedfc6790a8111076/co2_emissions_per_capita.csv';

const row = (d) => {
  d.emissions = +d[
    'Per capita CO2 emissions'
  ];
  return d;
};

export const useData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(csvUrl, row).then(setData);
  }, []);

  return data;
};
