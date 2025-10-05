// 📌 Định nghĩa type cho Membership Tier
export type MembershipTierEnum = { basic: {} } | { premium: {} } | { vip: {} };

export type Tier = 'Basic' | 'Premium' | 'VIP';

// 📌 Helper convert Tier string → Anchor enum object
export const membershipTierEnum = (t: Tier): MembershipTierEnum =>
  t === 'Basic'
    ? { basic: {} }
    : t === 'Premium'
      ? { premium: {} }
      : { vip: {} };

// 📚 Định nghĩa type cho Book Category
export type BookCategoryEnum =
  | { fiction: {} }
  | { nonFiction: {} }
  | { science: {} }
  | { technology: {} }
  | { history: {} }
  | { biography: {} }
  | { romance: {} }
  | { mystery: {} }
  | { fantasy: {} }
  | { selfHelp: {} }
  | { business: {} }
  | { education: {} }
  | { children: {} }
  | { reference: {} }
  | { other: {} };

export type Category =
  | 'Fiction'
  | 'NonFiction'
  | 'Science'
  | 'Technology'
  | 'History'
  | 'Biography'
  | 'Romance'
  | 'Mystery'
  | 'Fantasy'
  | 'SelfHelp'
  | 'Business'
  | 'Education'
  | 'Children'
  | 'Reference'
  | 'Other';

// 📌 Helper convert Category string → Anchor enum object
export const bookCategoryEnum = (c: Category): BookCategoryEnum => {
  switch (c) {
    case 'Fiction':
      return { fiction: {} };
    case 'NonFiction':
      return { nonFiction: {} };
    case 'Science':
      return { science: {} };
    case 'Technology':
      return { technology: {} };
    case 'History':
      return { history: {} };
    case 'Biography':
      return { biography: {} };
    case 'Romance':
      return { romance: {} };
    case 'Mystery':
      return { mystery: {} };
    case 'Fantasy':
      return { fantasy: {} };
    case 'SelfHelp':
      return { selfHelp: {} };
    case 'Business':
      return { business: {} };
    case 'Education':
      return { education: {} };
    case 'Children':
      return { children: {} };
    case 'Reference':
      return { reference: {} };
    default:
      return { other: {} };
  }
};

export const SEEDS = {
  COUNTER: 'library_counter',
  LIBRARY: 'library',
  MEMBER: 'member',
  BOOK: 'book',
  LOAN: 'loan',
  RESERVATION: 'reservation',
  REVIEW: 'review',
};
