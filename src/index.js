import React from 'react';
import ReactDOM from 'react-dom';
import { useData } from './useData';

const App = () => {
  const data = useData();

  if (!data) {
    return <pre>Loading...</pre>;
  }

  console.log(data);

  return (
    <div>
      Read {data.length} airports.
    </div>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);