// shared/reviews/api.ts
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from 'shared/hooks/useProgram';
import { REVIEW_MAX_COMMENT_LEN } from '../types/types';
import { pdaMember, pdaReview } from 'shared/utils/solana/pda';

export type ReviewInput = {
  rating: number; // 1..5
  comment: string; // <= 500 chars
};

// Validate theo ràng buộc on-chain
function validateReviewInput(input: ReviewInput) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error('Invalid rating: must be 1..5');
  }
  if (
    typeof input.comment !== 'string' ||
    input.comment.length > REVIEW_MAX_COMMENT_LEN
  ) {
    throw new Error(`Comment too long (>${REVIEW_MAX_COMMENT_LEN})`);
  }
}

export function useReviewApi() {
  const { program, connection, wallet } = useProgram(); // program: Anchor Program đã khởi tạo sẵn

  // Gửi review mới
  const submitReview = async (params: {
    library: PublicKey;
    book: PublicKey;
    rating: number;
    comment: string;
  }) => {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');
    validateReviewInput({ rating: params.rating, comment: params.comment });

    const user = wallet.publicKey;
    const [member] = pdaMember(params.library, user); // derive Member PDA [attached_file:2]
    const [review] = pdaReview(params.book, user); // derive Review PDA [attached_file:2]

    // Instruction reviewBook(rating u8, comment String) với accounts: review, book, member, library, user, systemProgram [attached_file:2]
    const sig = await program?.methods
      .reviewBook(params.rating, params.comment)
      .accounts({
        review,
        book: params.book,
        member,
        library: params.library,
        user,
        systemProgram: new PublicKey('11111111111111111111111111111111'),
      })
      .rpc();

    return { signature: sig, review, user };
  };

  // Đọc 1 review của user cho book
  const getUserReviewForBook = async (book: PublicKey, user: PublicKey) => {
    const [revPda] = pdaReview(book, user);
    try {
      const acc = await program?.account.review.fetch(revPda);
      return { publicKey: revPda, account: acc };
    } catch (e) {
      // Không tồn tại
      return null;
    }
  };

  // Liệt kê review theo book (GPA + filter memcmp offset 8)
  const listReviewsByBook = async (book: PublicKey) => {
    // Review layout: discriminator(8) + book Pubkey ngay đầu -> offset 8 [attached_file:2]
    const filters = [{ memcmp: { offset: 8, bytes: book.toBase58() } }];
    const items = await program?.account.review.all(filters);
    return items;
  };

  // Tính sao trung bình client-side từ danh sách review (phòng khi muốn check chéo)
  const calcAverageFromReviews = (reviews: Array<{ account: any }>) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + (r.account.rating as number), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  // Helpers UX
  const canReview = async (params: { library: PublicKey; user: PublicKey }) => {
    // Kiểm tra member isActive và không expired theo logic on-chain yêu cầu trước khi review [attached_file:2]
    const [memberPda] = pdaMember(params.library, params.user);
    try {
      const m = (await program?.account.member.fetch(memberPda)) as any;
      const now = Math.floor(Date.now() / 1000);
      const active = Boolean(m.isActive) && Number(m.expiresAt) > now;
      return active;
    } catch {
      return false;
    }
  };

  return {
    submitReview,
    getUserReviewForBook,
    listReviewsByBook,
    calcAverageFromReviews,
    canReview,
    connection,
    program,
  };
}
