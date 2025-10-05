// Minimal IDL aligned to your Anchor program surface.
// This IDL defines instructions, accounts, types used by client.
// If you update the on-chain program, regenerate/align this IDL.
export const IDL = {
  version: '0.1.0',
  name: 'enhanced_decentralized_library',
  instructions: [
    {
      name: 'initializeCounter',
      accounts: [
        { name: 'counter', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },

    {
      name: 'initializeLibrary',
      accounts: [
        { name: 'counter', isMut: true, isSigner: false },
        { name: 'library', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'membershipFee', type: 'u64' },
        { name: 'lateFeePerDay', type: 'u64' },
        { name: 'maxBorrowDays', type: 'u32' },
        { name: 'paymentMint', type: 'publicKey' },
        { name: 'index', type: 'u32' },
      ],
    },

    {
      name: 'registerMember',
      accounts: [
        { name: 'member', isMut: true, isSigner: false },
        { name: 'library', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'libraryTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'membershipTier', type: { defined: 'MembershipTier' } },
      ],
    },

    {
      name: 'addBook',
      accounts: [
        { name: 'book', isMut: true, isSigner: false },
        { name: 'library', isMut: true, isSigner: false },
        { name: 'librarian', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'title', type: 'string' },
        { name: 'authorName', type: 'string' },
        { name: 'isbn', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'category', type: { defined: 'BookCategory' } },
        { name: 'language', type: 'string' },
        { name: 'publisher', type: 'string' },
        { name: 'publicationYear', type: 'u16' },
        { name: 'pages', type: 'u16' },
        { name: 'price', type: 'u64' },
        { name: 'rentalPrice', type: 'u64' },
        { name: 'maxRentalDays', type: 'u32' },
        { name: 'isFree', type: 'bool' },
        { name: 'isNft', type: 'bool' },
        { name: 'fileUrl', type: 'string' },
        { name: 'coverUrl', type: 'string' },
        { name: 'copiesAvailable', type: 'u32' },
      ],
    },

    {
      name: 'borrowBook',
      accounts: [
        { name: 'loan', isMut: true, isSigner: false },
        { name: 'book', isMut: true, isSigner: false },
        { name: 'member', isMut: true, isSigner: false },
        { name: 'library', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'libraryTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'rentalDays', type: 'u32' }],
    },

    {
      name: 'returnBook',
      accounts: [
        { name: 'loan', isMut: true, isSigner: false },
        { name: 'book', isMut: true, isSigner: false },
        { name: 'member', isMut: true, isSigner: false },
        { name: 'library', isMut: false, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'libraryTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },

    {
      name: 'reserveBook',
      accounts: [
        { name: 'reservation', isMut: true, isSigner: false },
        { name: 'book', isMut: false, isSigner: false },
        { name: 'member', isMut: false, isSigner: false },
        { name: 'library', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'libraryTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'priorityFee', type: 'u64' }],
    },

    {
      name: 'reviewBook',
      accounts: [
        { name: 'review', isMut: true, isSigner: false },
        { name: 'book', isMut: true, isSigner: false },
        { name: 'member', isMut: false, isSigner: false },
        { name: 'library', isMut: false, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'rating', type: 'u8' },
        { name: 'comment', type: 'string' },
      ],
    },

    {
      name: 'renewMembership',
      accounts: [
        { name: 'member', isMut: true, isSigner: false },
        { name: 'library', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'libraryTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'extensionMonths', type: 'u32' }],
    },

    {
      name: 'upgradeMembership',
      accounts: [
        { name: 'member', isMut: true, isSigner: false },
        { name: 'library', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'libraryTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'newTier', type: { defined: 'MembershipTier' } }],
    },

    {
      name: 'withdrawFunds',
      accounts: [
        { name: 'library', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'libraryTokenAccount', isMut: true, isSigner: false },
        { name: 'authorityTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'index', type: 'u32' },
        { name: 'amount', type: 'u64' },
      ],
    },
  ],
  accounts: [
    { name: 'LibraryCounter' },
    { name: 'Library' },
    { name: 'Member' },
    { name: 'Book' },
    { name: 'Loan' },
    { name: 'Reservation' },
    { name: 'Review' },
  ],
  types: [
    {
      name: 'MembershipTier',
      type: {
        kind: 'enum',
        variants: [{ name: 'Basic' }, { name: 'Premium' }, { name: 'VIP' }],
      },
    },
    {
      name: 'BookCategory',
      type: {
        kind: 'enum',
        variants: [
          { name: 'Fiction' },
          { name: 'NonFiction' },
          { name: 'Science' },
          { name: 'Technology' },
          { name: 'History' },
          { name: 'Biography' },
          { name: 'Romance' },
          { name: 'Mystery' },
          { name: 'Fantasy' },
          { name: 'SelfHelp' },
          { name: 'Business' },
          { name: 'Education' },
          { name: 'Children' },
          { name: 'Reference' },
          { name: 'Other' },
        ],
      },
    },
  ],
} as const;
