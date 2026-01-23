/**
 * Festival and Holiday Keywords Configuration
 * Used for intelligent filtering of holidays from Calendarific API
 */

// Festival keywords for intelligent categorization
export const FESTIVAL_KEYWORDS = [
  // Hindu Festivals
  'diwali', 'deepavali', 'holi', 'navratri', 'dussehra', 'dussera', 'ganesh', 'ganesha',
  'janmashtami', 'karva chauth', 'karwa chauth', 'raksha bandhan', 'rakshabandhan',
  'makar sankranti', 'pongal', 'onam', 'durga puja', 'kali puja', 'saraswati puja',
  'vishwakarma puja', 'jagannath', 'rath yatra', 'teej', 'akshaya tritiya',
  
  // Islamic Festivals
  'eid', 'ramadan', 'ramzan', 'muharram', 'ashura', 'mawlid', 'shab-e-barat',
  'shab-e-qadr', 'bakrid', 'bakr-id',
  
  // Christian Festivals
  'christmas', 'easter', 'good friday', 'palm sunday', 'epiphany', 'ascension',
  'pentecost', 'all saints', 'advent',
  
  // Sikh Festivals
  'guru nanak', 'guru gobind', 'baisakhi', 'vaisakhi', 'guru purab',
  
  // Buddhist/Jain Festivals
  'buddha purnima', 'vesak', 'mahavir jayanti', 'paryushan',
  
  // Regional/Cultural
  'bihu', 'poila boishakh', 'ugadi', 'gudi padwa', 'vishu', 'baisakhi',
  'lohri', 'maagh bihu', 'kite festival', 'harvest festival'
];

// National holidays keywords
export const NATIONAL_KEYWORDS = [
  'independence', 'republic', 'gandhi', 'nehru', 'national', 'patriot',
  'freedom', 'liberation', 'constitution', 'martyrs'
];

// Optional/Observance keywords (usually not paid holidays)
export const OBSERVANCE_KEYWORDS = [
  'day', 'week', 'awareness', 'international', 'world', 'global',
  'observance', 'commemoration', 'remembrance', 'solidarity'
];

// State-specific keywords for regional filtering
export const STATE_KEYWORDS = {
  'maharashtra': ['gudi padwa', 'maharashtra day', 'shivaji'],
  'gujarat': ['gujarat day', 'navratri', 'uttarayan'],
  'punjab': ['baisakhi', 'vaisakhi', 'punjab day', 'guru nanak'],
  'west bengal': ['poila boishakh', 'durga puja', 'kali puja', 'bengal'],
  'tamil nadu': ['pongal', 'tamil new year', 'tamil nadu day'],
  'kerala': ['onam', 'vishu', 'kerala day'],
  'karnataka': ['karnataka rajyotsava', 'ugadi', 'karnataka day'],
  'andhra pradesh': ['ugadi', 'andhra pradesh day', 'telugu new year'],
  'telangana': ['telangana formation day', 'ugadi', 'bonalu'],
  'rajasthan': ['rajasthan day', 'teej', 'gangaur'],
  'haryana': ['haryana day', 'karva chauth'],
  'himachal pradesh': ['himachal day'],
  'uttarakhand': ['uttarakhand day'],
  'jharkhand': ['jharkhand day'],
  'chhattisgarh': ['chhattisgarh day'],
  'odisha': ['odisha day', 'jagannath', 'rath yatra'],
  'assam': ['bihu', 'assam day'],
  'manipur': ['manipur day'],
  'meghalaya': ['meghalaya day'],
  'mizoram': ['mizoram day'],
  'nagaland': ['nagaland day'],
  'sikkim': ['sikkim day'],
  'tripura': ['tripura day'],
  'arunachal pradesh': ['arunachal pradesh day'],
  'goa': ['goa day', 'liberation day']
};

// Holiday importance levels for prioritization
export const IMPORTANCE_LEVELS = {
  CRITICAL: ['independence day', 'republic day', 'gandhi jayanti', 'diwali', 'eid', 'christmas'],
  HIGH: ['holi', 'dussehra', 'durga puja', 'good friday', 'guru nanak jayanti'],
  MEDIUM: ['karva chauth', 'raksha bandhan', 'janmashtami', 'mahavir jayanti'],
  LOW: ['world environment day', 'international yoga day', 'teachers day']
};

// Company policy templates for different types of organizations
export const COMPANY_POLICY_TEMPLATES = {
  TECH_STARTUP: {
    name: 'Tech Startup Policy',
    description: 'Modern tech company with flexible holiday policy',
    includeCategories: ['national', 'religious'],
    excludeObservances: true,
    maxHolidays: 15,
    allowOptional: true
  },
  TRADITIONAL_CORPORATE: {
    name: 'Traditional Corporate Policy',
    description: 'Conservative corporate policy with standard holidays',
    includeCategories: ['national', 'religious'],
    excludeObservances: true,
    maxHolidays: 12,
    allowOptional: false
  },
  GOVERNMENT_OFFICE: {
    name: 'Government Office Policy',
    description: 'Government office with comprehensive holiday list',
    includeCategories: ['national', 'religious', 'public'],
    excludeObservances: false,
    maxHolidays: 20,
    allowOptional: true
  },
  MANUFACTURING: {
    name: 'Manufacturing Policy',
    description: 'Manufacturing company with essential holidays only',
    includeCategories: ['national'],
    excludeObservances: true,
    maxHolidays: 10,
    allowOptional: false
  }
};