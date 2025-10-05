import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export enum MembershipTier {
  Basic = 'Basic',
  Premium = 'Premium',
  VIP = 'VIP',
}
export enum BookCategory {
  Fiction = 'Fiction',
  NonFiction = 'NonFiction',
  Science = 'Science',
  Technology = 'Technology',
  History = 'History',
  Biography = 'Biography',
  Romance = 'Romance',
  Mystery = 'Mystery',
  Fantasy = 'Fantasy',
  SelfHelp = 'SelfHelp',
  Business = 'Business',
  Education = 'Education',
  Children = 'Children',
  Reference = 'Reference',
  Other = 'Other',
}

export interface LibraryCounter {
  authority: PublicKey;
  nextIndex: number;
}

export interface Library {
  authority: PublicKey;
  name: string;
  description: string;
  membershipFee: anchor.BN;
  lateFeePerDay: anchor.BN;
  maxBorrowDays: number;
  paymentMint: PublicKey;
  totalBooks: number;
  totalMembers: number;
  totalRevenue: anchor.BN;
  createdAt: anchor.BN;
  isActive: boolean;
}

export interface Member {
  user: PublicKey;
  name: string;
  email: string;
  membershipTier: MembershipTier;
  joinedAt: anchor.BN;
  expiresAt: anchor.BN;
  booksBorrowed: number;
  totalFines: anchor.BN;
  isActive: boolean;
  reputationScore: number;
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
  price: anchor.BN;
  rentalPrice: anchor.BN;
  maxRentalDays: number;
  isFree: boolean;
  isNft: boolean;
  fileUrl: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  timesBorrowed: number;
  addedAt: anchor.BN;
  lastUpdated: anchor.BN;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  ratingSum: anchor.BN;
}

export interface Loan {
  book: PublicKey;
  member: PublicKey;
  library: PublicKey;
  borrowedAt: anchor.BN;
  dueDate: anchor.BN;
  returnedAt: anchor.BN;
  rentalFee: anchor.BN;
  fineAmount: anchor.BN;
  isReturned: boolean;
  isFinePaid: boolean;
}

export interface Reservation {
  book: PublicKey;
  member: PublicKey;
  reservedAt: anchor.BN;
  expiresAt: anchor.BN;
  priorityFee: anchor.BN;
  isActive: boolean;
}

export interface Review {
  book: PublicKey;
  reviewer: PublicKey;
  rating: number;
  comment: string;
  createdAt: anchor.BN;
}

export interface CreateLibraryFormData {
  name: string;
  description: string;
  membershipFee: number;
  lateFeePerDay: number;
  maxBorrowDays: number;
  paymentMint: string;
}
export interface RegisterMemberFormData {
  name: string;
  email: string;
  membershipTier: MembershipTier;
}
export interface AddBookFormData {
  title: string;
  authorName: string;
  isbn: string;
  description: string;
  category: BookCategory;
  language: string;
  publisher: string;
  publicationYear: number;
  pages: number;
  price: number;
  rentalPrice: number;
  maxRentalDays: number;
  isFree: boolean;
  isNft: boolean;
  fileUrl: string;
  coverUrl: string;
  copiesAvailable: number;
}
export interface ReviewBookFormData {
  rating: number;
  comment: string;
}
