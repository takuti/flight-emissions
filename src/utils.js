export const round = (n, d) => (
  Math.round(n * Math.pow(10, d)) / Math.pow(10, d)
);