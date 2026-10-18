import { PriorityLevel, CaseStatus, ProblemCategory, UserRole } from '../types';

export const APP_NAME_BN = 'নাগরিক সাথী এআই';
export const APP_NAME_EN = 'Nagorik Sathi AI';
export const APP_TAGLINE = 'সিটি কর্পোরেশন এআই-সহায়তাপ্রাপ্ত সমন্বয় ও নাগরিক সেবা প্ল্যাটফর্ম';
export const CORE_PRINCIPLE = 'AI proposes, people decide (এআই প্রস্তাব করে, মানুষ সিদ্ধান্ত নেয়)';

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; labelEn: string; color: string; bg: string; border: string; description: string }
> = {
  emergency: {
    label: 'জরুরি',
    labelEn: 'Emergency',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    description: 'জীবন ও নিরাপত্তার তাৎক্ষণিক ঝুঁকি বা সংকট'
  },
  high: {
    label: 'উচ্চ',
    labelEn: 'High',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FDBA74',
    description: 'গুরুতর ব্যাঘাত বা দ্রুত বিস্তারকারী জটিল সমস্যা'
  },
  medium: {
    label: 'মাঝারি',
    labelEn: 'Medium',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
    description: 'নাগরিক ভোগান্তি সৃষ্টিকারী লক্ষণীয় সমস্যা'
  },
  low: {
    label: 'নিম্ন',
    labelEn: 'Low',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#93C5FD',
    description: 'ছোট বা সাধারণ সংস্কারযোগ্য সমস্যা'
  }
};

export const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; labelEn: string; color: string; bg: string; step: number; description: string }
> = {
  submitted: {
    label: 'রিপোর্ট জমা হয়েছে',
    labelEn: 'Submitted',
    color: '#4B5563',
    bg: '#F3F4F6',
    step: 1,
    description: 'নাগরিকের অভিযোগ সফলভাবে সিস্টেমে নিবন্ধিত হয়েছে'
  },
  verified: {
    label: 'দায়িত্ব যাচাই সম্পন্ন',
    labelEn: 'Verified',
    color: '#2563EB',
    bg: '#EFF6FF',
    step: 2,
    description: 'ওয়ার্ড ডেস্ক বা সমন্বয়ক কর্তৃক দায়িত্বপ্রাপ্ত বিভাগ নির্ধারিত হয়েছে'
  },
  under_inspection: {
    label: 'মাঠ পর্যায়ে পরিদর্শন চলছে',
    labelEn: 'Under Inspection',
    color: '#D97706',
    bg: '#FFFBEB',
    step: 3,
    description: 'দায়িত্বপ্রাপ্ত প্রকৌশলী বা কর্মকর্তা ঘটনাস্থলে পর্যবেক্ষণ করছেন'
  },
  in_progress: {
    label: 'কাজ চলমান',
    labelEn: 'In Progress',
    color: '#059669',
    bg: '#ECFDF5',
    step: 4,
    description: 'মাঠ পর্যায়ে সংস্কার বা সমাধানের কার্যক্রম চলছে'
  },
  resolved_pending_citizen: {
    label: 'সমাধান হয়েছে (প্রমাণ আপলোডকৃত)',
    labelEn: 'Resolved - Proof Uploaded',
    color: '#10B981',
    bg: '#D1FAE5',
    step: 5,
    description: 'মাঠ দল সমাধানের ছবি/ভিডিও প্রমাণসহ কাজ শেষ করেছে, নাগরিকের মতামতের অপেক্ষায়'
  },
  closed: {
    label: 'চূড়ান্তভাবে বন্ধ',
    labelEn: 'Closed',
    color: '#047857',
    bg: '#A7F3D0',
    step: 6,
    description: 'নাগরিক কর্তৃক যাচাইকৃত ও বিভাগীয় প্রধান কর্তৃক অনুমোদিত'
  },
  reopened: {
    label: 'পুনরায় তদন্তে প্রেরিত',
    labelEn: 'Reopened',
    color: '#DC2626',
    bg: '#FEE2E2',
    step: 4,
    description: 'সমাধান সন্তোষজনক না হওয়ায় নাগরিকের আপত্তির প্রেক্ষিতে পুনরায় পর্যালোচনা'
  },
  merged: {
    label: 'সংযুক্ত (ডুপ্লিকেট)',
    labelEn: 'Merged',
    color: '#6B7280',
    bg: '#F3F4F6',
    step: 0,
    description: 'একই এলাকার বিদ্যমান মূল অভিযোগের সাথে একীভূত করা হয়েছে'
  }
};

export const CATEGORY_CONFIG: Record<ProblemCategory, { label: string; icon: string; defaultDept: string }> = {
  drainage: { label: 'ড্রেনেজ ও পয়ঃনিষ্কাশন', icon: 'Droplets', defaultDept: 'dept_drainage' },
  waste: { label: 'বর্জ্য ব্যবস্থাপনা', icon: 'Trash2', defaultDept: 'dept_waste' },
  road_engineering: { label: 'সড়ক ও অবকাঠামো মেরামত', icon: 'Hammer', defaultDept: 'dept_road' },
  lighting: { label: 'সড়ক বাতি ও বিদ্যুৎ', icon: 'Lightbulb', defaultDept: 'dept_lighting' },
  water_supply: { label: 'পানি সরবরাহ ও নলকূপ', icon: 'LifeBuoy', defaultDept: 'dept_water' },
  encroachment: { label: 'ফুটপাত ও অবৈধ দখল', icon: 'ShieldAlert', defaultDept: 'dept_estate' },
  vector_control: { label: 'মশক নিধন ও স্বাস্থ্য', icon: 'Bug', defaultDept: 'dept_health' }
};

export const MUNICIPAL_DEPARTMENTS = [
  { id: 'dept_drainage', name: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ', shortName: 'ড্রেনেজ', code: 'DND' },
  { id: 'dept_waste', name: 'বর্জ্য ব্যবস্থাপনা বিভাগ', shortName: 'বর্জ্য ব্যবস্থাপনা', code: 'WMD' },
  { id: 'dept_road', name: 'সড়ক ও অবকাঠামো প্রকৌশল বিভাগ', shortName: 'সড়ক প্রকৌশল', code: 'RED' },
  { id: 'dept_lighting', name: 'বিদ্যুৎ ও সড়ক বাতি বিভাগ', shortName: 'বিদ্যুৎ', code: 'ELD' },
  { id: 'dept_health', name: 'স্বাস্থ্য ও মশক নিধন বিভাগ', shortName: 'স্বাস্থ্য', code: 'HLD' },
  { id: 'dept_estate', name: 'এস্টেট ও সম্পত্তি শাখা', shortName: 'এস্টেট', code: 'ESD' }
];

export const MUNICIPAL_WARDS = [
  { id: 12, name: 'ওয়ার্ড ১২', area: 'উত্তরা সেক্টর ৭ ও ৯ এলাকা', councilor: 'মোঃ রফিকুল ইসলাম', phone: '01711-000012' },
  { id: 13, name: 'ওয়ার্ড ১৩', area: 'মিরপুর ১০ ও ১১ এলাকা', councilor: 'বেগম পারভীন আক্তার', phone: '01711-000013' },
  { id: 14, name: 'ওয়ার্ড ১৪', area: 'ধানমন্ডি ও সংলগ্ন এলাকা', councilor: 'আনিসুর রহমান', phone: '01711-000014' },
  { id: 15, name: 'ওয়ার্ড ১৫', area: 'গুলশান ও বনানী অঞ্চল', councilor: 'মাহবুব আলম', phone: '01711-000015' }
];

export const DEMO_ROLES: { role: UserRole; title: string; subtitle: string; icon: string }[] = [
  { role: 'citizen', title: 'নাগরিক (Citizen)', subtitle: 'সমস্যা জানানো, ট্র্যাকিং ও মতামত প্রদান', icon: 'User' },
  { role: 'ward_desk', title: 'ওয়ার্ড ডেস্ক (Ward Desk Staff)', subtitle: 'রিপোর্ট ট্রায়াজ ও এআই দায়িত্ব যাচাই', icon: 'LayoutDashboard' },
  { role: 'field_officer', title: 'মাঠ পর্যায়ের কর্মকর্তা (Field Staff)', subtitle: 'পরিদর্শন ও সমাধান প্রমাণ আপলোড', icon: 'Wrench' },
  { role: 'coordinator', title: 'সমন্বয়ক (Case Coordinator)', subtitle: 'বহু-বিভাগীয় অনুক্রম ও এসএলএ তদারকি', icon: 'GitMerge' },
  { role: 'admin', title: 'প্রশাসক (System Admin)', subtitle: 'এআই গেট, নিয়মাবলী ও অডিট লগ প্রশাসন', icon: 'ShieldCheck' }
];
