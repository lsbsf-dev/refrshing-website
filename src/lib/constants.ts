/**
 * Application Constants
 * Avoids hardcoding shared values across components and layouts.
 */

// ACTIVE_EVENT_ID is now fetched dynamically from settings or URL params
export const REGISTRATION_URL = "https://forms.gle/dsW4cvmXwK61BHt96";
export const EVENT_THEME = "Greater Glory";
export const EVENT_EDITION = "Refreshing @40";
export const EVENT_DATES = "10th – 14th August, 2026";
export const EVENT_TEXTS = "Haggai 2:9; Isaiah 52:1–7";
export const EVENT_VENUE = "Baptist Academy, Obanikoro, Lagos";
export const EVENT_YEAR = "2026";

export const LAGOS_CENTRAL_ASSOCIATIONS = [
  'Apapa Association',
  'Greater Grace Association',
  'JT Ayorinde Association',
  'New Creature Association',
  'New Heights Association',
  'New Life Association',
  'Shalom Association',
  'Strong Tower Association',
  'United Association',
  'Unity Association',
];

export const LAGOS_EAST_ASSOCIATIONS = [
  'Abundant Blessing',
  'Abundant Grace Association',
  'Abundant Life Association',
  'Afurugbin Association',
  'Amazing Grace Association',
  'Christ Kingdom Association',
  'Evangel Association',
  'Gideon 1 Association',
  'Gideon 2 Association',
  'Hebron Association',
  'Hephzibah Association',
  'Irepodun Association',
  'Itesiwaju Association',
  'Kingdom Harvesters Association',
  'The Christ Love Association',
  'The Great Olaoluwa Association',
];

export const LAGOS_WEST_ASSOCIATIONS = [
  'Abundant Grace Association',
  'Anointed Association',
  'Apapa Association',
  'Chosen Generation Association',
  'Cornerstone Association',
  'Good Herald Association',
  'Good Message Association',
  'Good News Association',
  'Greater Grace Association',
  'Ifelodun Association',
  'Ireti Ogo Association',
  'JT Ayorinde Association',
  'Living Faith Associational',
  'Maranatha Association',
  'New Creation Association',
  'New Creature Association',
  'New Heights Association',
  'New Life Association',
  'Pentecost Association',
  'Redeemers Association',
  'Shalom Association',
  'Strong Tower Association',
  'United Association',
  'Unity Association',
  'Victory Land Association',
  'Victory Life Association',
  'Victory Light Association',
];

export const CAMPUS_FELLOWSHIPS = [
  'ACOED',
  'FCE (T) AKOKA',
  'LASPOTECH',
  'LASU',
  'MEDILAG',
  'MOCPED',
  'OCEANOGRAPHY',
  'OGITECH',
  'UNILAG',
  'YABATECH',
  'Others',
];

export const ALL_ASSOCIATIONS_BY_CONFERENCE: Record<string, string[]> = {
  'lagos_central': LAGOS_CENTRAL_ASSOCIATIONS,
  'lagos_east': LAGOS_EAST_ASSOCIATIONS,
  'lagos_west': LAGOS_WEST_ASSOCIATIONS,
  'campus_fellowship': CAMPUS_FELLOWSHIPS,
};
