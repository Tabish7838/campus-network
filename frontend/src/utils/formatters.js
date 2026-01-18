export const formatTrustScore = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0%';
  }
  const percentage = Math.round(Number(value));
  return `${percentage}%`;
};

export const formatLevel = (level) => {
  if (!level) return 'Unknown';
  return level.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills.filter(Boolean);
};

export const formatName = (name) => {
  if (!name) return 'Anonymous';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
