import { select } from 'd3';
import { round } from '../utils';

const missingDataColor = '#d8d8d8';

export const WorldMap = ({
  worldAtlas: { countries, interiors },
  path,
  rowByNumericCode,
  emissions,
  colorValue,
  colorScale,
}) => (
  <g className="map">
    <path className="sphere" d={path({ type: 'Sphere' })} />
    {countries.features.map((feature) => {
      const d = rowByNumericCode.get(feature.id);
      return (
        <path
          className="countries"
          fill={
            (d && d.emissions < emissions) 
              ? colorScale(colorValue(d)) 
              : missingDataColor
          }
          onMouseEnter={(e) => 
            select(e.target).attr(
              "fill",
              d ? colorScale(colorValue(d)) : missingDataColor
            )
          }
          onMouseLeave={(e) => 
            select(e.target).attr(
              "fill",
              (d && d.emissions < emissions) 
                ? colorScale(colorValue(d))
                : missingDataColor
            )
          }
          d={path(feature)}
        >
          <title>
            {feature.properties.name}: {d ? round(d.emissions, 3) + ' tonnes/capita' : 'n/a'}
          </title>
        </path>
      );
    })}
    <path className="interiors" d={path(interiors)} />
  </g>
);