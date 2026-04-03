export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createScaler = (width) => {
  const base = width / 390;
  return (size, min = size * 0.85, max = size * 1.25) => clamp(Math.round(size * base), min, max);
};
