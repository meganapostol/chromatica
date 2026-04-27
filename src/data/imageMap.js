// Maps the static /images/[id].jpg paths in colors.js to the actual hosted assets.
// Uploaded to base44 file storage; rewritten at runtime so the chamber renders correctly.
const IMAGE_MAP = {
  '/images/sepia.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/ffd620d79_sepia.jpg',
  '/images/lead-white.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/e6ab7268d_lead-white.jpg',
  '/images/vantablack.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/9e1dc3bd3_vantablack.jpg',
  '/images/burnt-sienna.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/c07a20757_burnt-sienna.jpg',
  '/images/mummy-brown.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/021177b2a_mummy-brown.jpg',
  '/images/yinmn.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/a3922dadc_yinmn.jpg',
  '/images/prussian-blue.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/1d26ce366_prussian-blue.jpg',
  '/images/indigo.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/80557755d_indigo.jpg',
  '/images/klein-blue.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/6fc5195b4_klein-blue.jpg',
  '/images/han-blue.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/cd3e6c266_han-blue.jpg',
  '/images/maya-blue.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/4fe6c9558_maya-blue.jpg',
  '/images/egyptian-blue.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/7362b98b1_egyptian-blue.jpg',
  '/images/lapis.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/486be291f_lapis.jpg',
  '/images/chartreuse.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/b97bb1f47_chartreuse.jpg',
  '/images/celadon.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/c35007b2f_celadon.jpg',
  '/images/malachite.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/1fa62fd8d_malachite.jpg',
  '/images/scheeles-green.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/d66503b2a_scheeles-green.jpg',
  '/images/verdigris.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/176206af1_verdigris.jpg',
  '/images/ochre.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/caecc000e_ochre.jpg',
  '/images/naples-yellow.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/e95d78c64_naples-yellow.jpg',
  '/images/gamboge.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/69e4e1cba_gamboge.jpg',
  '/images/orpiment.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/a7274325a_orpiment.jpg',
  '/images/indian-yellow.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/d58f6566a_indian-yellow.jpg',
  '/images/saffron.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/0d8f21d0c_saffron.jpg',
  '/images/mauveine.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/70e6184dd_mauveine.jpg',
  '/images/tyrian-purple.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/895caacce_tyrian-purple.jpg',
  '/images/coral.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/c7f3b86b7_coral.jpg',
  '/images/madder.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/f56eb818a_madder.jpg',
  '/images/cinnabar.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/c153d049f_cinnabar.jpg',
  '/images/cochineal.jpg': 'https://media.base44.com/images/public/69eef675347dd19b7960d413/8d018a723_cochineal.jpg'
};

export function resolveImage(path) {
  if (!path) return path;
  return IMAGE_MAP[path] || path;
}