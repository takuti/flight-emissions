export const FlightRoutes = ({
  path,
  projection,
  coordinates,
}) => (
  <g className="routes">
    {coordinates.map(([src, dst]) => {
      const [x1, y1] = projection(src);
      const [x2, y2] = projection(dst);
      return (
        <>
          <circle cx={x1} cy={y1} r={3} />
          <circle cx={x2} cy={y2} r={3} />
        </>
      );
    })}
    <path
      className="route"
      d={path({ type: "MultiLineString", coordinates: coordinates })}
    />
  </g>
);