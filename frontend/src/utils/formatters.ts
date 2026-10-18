// Formatting utilities for Bangla civic interface

export const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBanglaNumber = (num: number | string): string => {
  return String(num).replace(/\d/g, d => BANGLA_DIGITS[parseInt(d, 10)]);
};

export const formatBanglaDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBanglaNumber(date.getDate());
    const month = months[date.getMonth()];
    const year = toBanglaNumber(date.getFullYear());
    
    let hours = date.getHours();
    const minutes = toBanglaNumber(String(date.getMinutes()).padStart(2, '0'));
    const ampm = hours >= 12 ? 'বিকাল/রাত' : 'সকাল';
    hours = hours % 12 || 12;
    const hoursBn = toBanglaNumber(hours);

    return `${day} ${month} ${year}, ${ampm} ${hoursBn}:${minutes}`;
  } catch {
    return isoString;
  }
};

export const getRelativeTimeAgo = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 5) return 'এইমাত্র';
    if (diffMinutes < 60) return `${toBanglaNumber(diffMinutes)} মিনিট আগে`;
    if (diffHours < 24) return `${toBanglaNumber(diffHours)} ঘণ্টা আগে`;
    return `${toBanglaNumber(diffDays)} দিন আগে`;
  } catch {
    return '';
  }
};

export const calculateSlaCountdown = (deadlineIso: string): { text: string; isBreached: boolean } => {
  try {
    const deadline = new Date(deadlineIso);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) {
      const overdueHours = Math.abs(Math.floor(diffMs / 3600000));
      return {
        text: `এসএলএ সময় অতিক্রান্ত (${toBanglaNumber(overdueHours)} ঘণ্টা বিলম্ব)`,
        isBreached: true
      };
    }

    const remainingHours = Math.floor(diffMs / 3600000);
    const remainingMinutes = Math.floor((diffMs % 3600000) / 60000);

    if (remainingHours > 0) {
      return {
        text: `বাকি আছে ${toBanglaNumber(remainingHours)} ঘণ্টা ${toBanglaNumber(remainingMinutes)} মিনিট`,
        isBreached: false
      };
    }
    return {
      text: `বাকি আছে ${toBanglaNumber(remainingMinutes)} মিনিট`,
      isBreached: false
    };
  } catch {
    return { text: 'এসএলএ নির্ধারিত নয়', isBreached: false };
  }
};
