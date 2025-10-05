// shared/types/index.ts
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
);

// Enums matching on-chain
export enum BookCategory {
  Fiction = 0,
  NonFiction = 1,
  Science = 2,
  Technology = 3,
  History = 4,
  Biography = 5,
  Romance = 6,
  Mystery = 7,
  Fantasy = 8,
  SelfHelp = 9,
  Business = 10,
  Education = 11,
  Children = 12,
  Reference = 13,
  Other = 14,
}

export enum MembershipTier {
  Basic = 0,
  Premium = 1,
  VIP = 2,
}

// Constants from smart contract
export const LIBRARY_MAX_NAME_LEN = 100;
export const LIBRARY_MAX_DESC_LEN = 500;
export const BOOK_MAX_TITLE_LEN = 200;
export const BOOK_MAX_AUTHOR_LEN = 100;
export const BOOK_MAX_DESC_LEN = 1000;
export const BOOK_MAX_ISBN_LEN = 20;
export const BOOK_MAX_LANGUAGE_LEN = 50;
export const BOOK_MAX_PUBLISHER_LEN = 100;
export const BOOK_MAX_URL_LEN = 300;
export const MEMBER_MAX_NAME_LEN = 100;
export const MEMBER_MAX_EMAIL_LEN = 100;
export const REVIEW_MAX_COMMENT_LEN = 500;

// Form Types
export interface CreateLibraryFormData {
  name: string;
  description: string;
  membershipFee: number;
  lateFeePerDay: number;
  maxBorrowDays: number;
  paymentMint: string;
}

export interface AddBookFormData {
  title: string;
  authorName: string;
  isbn: string | undefined; // Fix: explicit undefined
  description: string | undefined; // Fix: explicit undefined
  category: keyof typeof BookCategory;
  language: string | undefined; // Fix: explicit undefined
  publisher: string | undefined; // Fix: explicit undefined
  publicationYear: number | undefined; // Fix: explicit undefined
  pages: number | undefined; // Fix: explicit undefined
  price: number | undefined; // Fix: explicit undefined
  rentalPrice: number | undefined; // Fix: explicit undefined
  maxRentalDays: number | undefined; // Fix: explicit undefined
  isFree: boolean;
  isNft: boolean;
  fileUrl: string | undefined; // Fix: explicit undefined
  coverUrl: string | undefined; // Fix: explicit undefined
  copiesAvailable: number;
}

export interface RegisterMemberFormData {
  name: string;
  email: string;
  membershipTier: keyof typeof MembershipTier;
}

export interface BorrowBookFormData {
  rentalDays: number;
}

export interface ReserveBookFormData {
  priorityFee: number;
}

export interface ReviewBookFormData {
  rating: number; // 1-5
  comment: string;
}

export interface RenewMembershipFormData {
  extensionMonths: number;
}

export interface UpgradeMembershipFormData {
  newTier: keyof typeof MembershipTier;
}

export interface WithdrawFundsFormData {
  amount: number;
}

// Account interfaces (matching on-chain structs)
export interface Library {
  authority: PublicKey;
  name: string;
  description: string;
  membershipFee: BN;
  lateFeePerDay: BN;
  maxBorrowDays: number;
  paymentMint: PublicKey;
  totalBooks: number;
  totalMembers: number;
  totalRevenue: BN;
  createdAt: BN;
  isActive: boolean;
  index: number;
}

export interface Book {
  library: PublicKey;
  addedBy: PublicKey;
  title: string;
  authorName: string;
  isbn: string;
  description: string;
  category: BookCategory;
  language: string;
  publisher: string;
  publicationYear: number;
  pages: number;
  price: BN;
  rentalPrice: BN;
  maxRentalDays: number;
  isFree: boolean;
  isNft: boolean;
  fileUrl: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  timesBorrowed: number;
  addedAt: BN;
  lastUpdated: BN;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  ratingSum: BN;
}

export interface Member {
  user: PublicKey;
  name: string;
  email: string;
  membershipTier: MembershipTier;
  joinedAt: BN;
  expiresAt: BN;
  booksBorrowed: number;
  totalFines: BN;
  isActive: boolean;
  reputationScore: number;
}

export interface Loan {
  book: PublicKey;
  member: PublicKey;
  library: PublicKey;
  borrowedAt: BN;
  dueDate: BN;
  returnedAt: BN;
  rentalFee: BN;
  fineAmount: BN;
  isReturned: boolean;
  isFinePaid: boolean;
}

export interface Reservation {
  book: PublicKey;
  member: PublicKey;
  reservedAt: BN;
  expiresAt: BN;
  priorityFee: BN;
  isActive: boolean;
}

export interface Review {
  book: PublicKey;
  reviewer: PublicKey;
  rating: number;
  comment: string;
  createdAt: BN;
}
