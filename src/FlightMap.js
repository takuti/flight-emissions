import { 
  geoEquirectangular,
  geoPath,
} from 'd3';
import { WorldMap } from './WorldMap'
import { FlightRoutes } from './FlightRoutes';

const projection = geoEquirectangular();
const path = geoPath(projection);

export const FlightMap = ({
  worldAtlas,
  rowByNumericCode,
  colorValue,
  colorScale,
  emissions,
  coordinates,
}) => (
  <>
    <WorldMap 
      worldAtlas={worldAtlas}
      path={path}
      rowByNumericCode={rowByNumericCode}
      emissions={emissions}
      colorValue={colorValue}
      colorScale={colorScale}
    />
    <FlightRoutes 
      path={path}
      projection={projection}
      coordinates={coordinates}
    />
  </>
);