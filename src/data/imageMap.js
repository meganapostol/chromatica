// Maps the static /images/[id].jpg paths in colors.js to the actual hosted assets.
// Megan's image folder will eventually populate /public/images/. Until then, we
// rewrite paths to the uploaded base44 file URLs so the chamber renders correctly.
const IMAGE_MAP = {
  '/images/tyrian-purple.jpg': 'https://media.base44.com/images/public/user_6984d3703b2fcdd6bf08782e/d00e4106a_sepia.jpg', // sepia placeholder; awaiting tyrian-purple asset
  '/images/vantablack.jpg': 'https://media.base44.com/images/public/user_6984d3703b2fcdd6bf08782e/5fdec2f01_vantablack.jpg',
  '/images/yinmn.jpg': 'https://media.base44.com/images/public/user_6984d3703b2fcdd6bf08782e/36965a871_yinmn.jpg'
};

export function resolveImage(path) {
  if (!path) return path;
  return IMAGE_MAP[path] || path;
}