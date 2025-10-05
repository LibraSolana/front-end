export type EnhancedDecentralizedLibraryIDLType = {
  version: '0.1.0';
  name: 'enhanced_decentralized_library';
  instructions: [
    {
      name: 'initializeCounter';
      accounts: [
        {
          name: 'counter';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'initializeLibrary';
      accounts: [
        {
          name: 'counter';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'description';
          type: 'string';
        },
        {
          name: 'membershipFee';
          type: 'u64';
        },
        {
          name: 'lateFeePerDay';
          type: 'u64';
        },
        {
          name: 'maxBorrowDays';
          type: 'u32';
        },
        {
          name: 'paymentMint';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'updateLibrary';
      accounts: [
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'name';
          type: {
            option: 'string';
          };
        },
        {
          name: 'description';
          type: {
            option: 'string';
          };
        },
        {
          name: 'membershipFee';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'lateFeePerDay';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'maxBorrowDays';
          type: {
            option: 'u32';
          };
        },
      ];
    },
    {
      name: 'deleteLibrary';
      accounts: [
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'registerMember';
      accounts: [
        {
          name: 'member';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'libraryTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'email';
          type: 'string';
        },
        {
          name: 'membershipTier';
          type: {
            defined: 'MembershipTier';
          };
        },
      ];
    },
    {
      name: 'updateMember';
      accounts: [
        {
          name: 'member';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'name';
          type: {
            option: 'string';
          };
        },
        {
          name: 'email';
          type: {
            option: 'string';
          };
        },
        {
          name: 'isActive';
          type: {
            option: 'bool';
          };
        },
      ];
    },
    {
      name: 'deleteMember';
      accounts: [
        {
          name: 'member';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'addBook';
      accounts: [
        {
          name: 'book';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'librarian';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'title';
          type: 'string';
        },
        {
          name: 'authorName';
          type: 'string';
        },
        {
          name: 'isbn';
          type: 'string';
        },
        {
          name: 'description';
          type: 'string';
        },
        {
          name: 'category';
          type: {
            defined: 'BookCategory';
          };
        },
        {
          name: 'language';
          type: 'string';
        },
        {
          name: 'publisher';
          type: 'string';
        },
        {
          name: 'publicationYear';
          type: 'u16';
        },
        {
          name: 'pages';
          type: 'u16';
        },
        {
          name: 'price';
          type: 'u64';
        },
        {
          name: 'rentalPrice';
          type: 'u64';
        },
        {
          name: 'maxRentalDays';
          type: 'u32';
        },
        {
          name: 'isFree';
          type: 'bool';
        },
        {
          name: 'isNft';
          type: 'bool';
        },
        {
          name: 'fileUrl';
          type: 'string';
        },
        {
          name: 'coverUrl';
          type: 'string';
        },
        {
          name: 'copiesAvailable';
          type: 'u32';
        },
      ];
    },
    {
      name: 'updateBook';
      accounts: [
        {
          name: 'book';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'title';
          type: {
            option: 'string';
          };
        },
        {
          name: 'description';
          type: {
            option: 'string';
          };
        },
        {
          name: 'price';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'rentalPrice';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'copiesAvailable';
          type: {
            option: 'u32';
          };
        },
        {
          name: 'isActive';
          type: {
            option: 'bool';
          };
        },
      ];
    },
    {
      name: 'deleteBook';
      accounts: [
        {
          name: 'book';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'borrowBook';
      accounts: [
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'book';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'member';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'libraryTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'rentalDays';
          type: 'u32';
        },
      ];
    },
    {
      name: 'returnBook';
      accounts: [
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'book';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'member';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'libraryTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'reserveBook';
      accounts: [
        {
          name: 'reservation';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'book';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'member';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'libraryTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'priorityFee';
          type: 'u64';
        },
      ];
    },
    {
      name: 'cancelReservation';
      accounts: [
        {
          name: 'reservation';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'book';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'reviewBook';
      accounts: [
        {
          name: 'review';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'book';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'member';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'rating';
          type: 'u8';
        },
        {
          name: 'comment';
          type: 'string';
        },
      ];
    },
    {
      name: 'renewMembership';
      accounts: [
        {
          name: 'member';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'libraryTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'extensionMonths';
          type: 'u32';
        },
      ];
    },
    {
      name: 'upgradeMembership';
      accounts: [
        {
          name: 'member';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'library';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'libraryTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'newTier';
          type: {
            defined: 'MembershipTier';
          };
        },
      ];
    },
    {
      name: 'withdrawFunds';
      accounts: [
        {
          name: 'library';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'libraryTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authorityTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'libraryCounter';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'nextIndex';
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'library';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'description';
            type: 'string';
          },
          {
            name: 'membershipFee';
            type: 'u64';
          },
          {
            name: 'lateFeePerDay';
            type: 'u64';
          },
          {
            name: 'maxBorrowDays';
            type: 'u32';
          },
          {
            name: 'paymentMint';
            type: 'publicKey';
          },
          {
            name: 'totalBooks';
            type: 'u32';
          },
          {
            name: 'totalMembers';
            type: 'u32';
          },
          {
            name: 'totalRevenue';
            type: 'u64';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
          {
            name: 'isActive';
            type: 'bool';
          },
          {
            name: 'index';
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'member';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'user';
            type: 'publicKey';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'email';
            type: 'string';
          },
          {
            name: 'membershipTier';
            type: {
              defined: 'MembershipTier';
            };
          },
          {
            name: 'joinedAt';
            type: 'i64';
          },
          {
            name: 'expiresAt';
            type: 'i64';
          },
          {
            name: 'booksBorrowed';
            type: 'u32';
          },
          {
            name: 'totalFines';
            type: 'u64';
          },
          {
            name: 'isActive';
            type: 'bool';
          },
          {
            name: 'reputationScore';
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'book';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'library';
            type: 'publicKey';
          },
          {
            name: 'addedBy';
            type: 'publicKey';
          },
          {
            name: 'title';
            type: 'string';
          },
          {
            name: 'authorName';
            type: 'string';
          },
          {
            name: 'isbn';
            type: 'string';
          },
          {
            name: 'description';
            type: 'string';
          },
          {
            name: 'category';
            type: {
              defined: 'BookCategory';
            };
          },
          {
            name: 'language';
            type: 'string';
          },
          {
            name: 'publisher';
            type: 'string';
          },
          {
            name: 'publicationYear';
            type: 'u16';
          },
          {
            name: 'pages';
            type: 'u16';
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'rentalPrice';
            type: 'u64';
          },
          {
            name: 'maxRentalDays';
            type: 'u32';
          },
          {
            name: 'isFree';
            type: 'bool';
          },
          {
            name: 'isNft';
            type: 'bool';
          },
          {
            name: 'fileUrl';
            type: 'string';
          },
          {
            name: 'coverUrl';
            type: 'string';
          },
          {
            name: 'totalCopies';
            type: 'u32';
          },
          {
            name: 'availableCopies';
            type: 'u32';
          },
          {
            name: 'timesBorrowed';
            type: 'u32';
          },
          {
            name: 'addedAt';
            type: 'i64';
          },
          {
            name: 'lastUpdated';
            type: 'i64';
          },
          {
            name: 'isActive';
            type: 'bool';
          },
          {
            name: 'averageRating';
            type: 'u8';
          },
          {
            name: 'totalReviews';
            type: 'u32';
          },
          {
            name: 'ratingSum';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'loan';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'book';
            type: 'publicKey';
          },
          {
            name: 'member';
            type: 'publicKey';
          },
          {
            name: 'library';
            type: 'publicKey';
          },
          {
            name: 'borrowedAt';
            type: 'i64';
          },
          {
            name: 'dueDate';
            type: 'i64';
          },
          {
            name: 'returnedAt';
            type: 'i64';
          },
          {
            name: 'rentalFee';
            type: 'u64';
          },
          {
            name: 'fineAmount';
            type: 'u64';
          },
          {
            name: 'isReturned';
            type: 'bool';
          },
          {
            name: 'isFinePaid';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'reservation';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'book';
            type: 'publicKey';
          },
          {
            name: 'member';
            type: 'publicKey';
          },
          {
            name: 'reservedAt';
            type: 'i64';
          },
          {
            name: 'expiresAt';
            type: 'i64';
          },
          {
            name: 'priorityFee';
            type: 'u64';
          },
          {
            name: 'isActive';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'review';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'book';
            type: 'publicKey';
          },
          {
            name: 'reviewer';
            type: 'publicKey';
          },
          {
            name: 'rating';
            type: 'u8';
          },
          {
            name: 'comment';
            type: 'string';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'MembershipTier';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Basic';
          },
          {
            name: 'Premium';
          },
          {
            name: 'VIP';
          },
        ];
      };
    },
    {
      name: 'BookCategory';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Fiction';
          },
          {
            name: 'NonFiction';
          },
          {
            name: 'Science';
          },
          {
            name: 'Technology';
          },
          {
            name: 'History';
          },
          {
            name: 'Biography';
          },
          {
            name: 'Romance';
          },
          {
            name: 'Mystery';
          },
          {
            name: 'Fantasy';
          },
          {
            name: 'SelfHelp';
          },
          {
            name: 'Business';
          },
          {
            name: 'Education';
          },
          {
            name: 'Children';
          },
          {
            name: 'Reference';
          },
          {
            name: 'Other';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'LibraryInitialized';
      fields: [
        {
          name: 'libraryPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'name';
          type: 'string';
          index: false;
        },
        {
          name: 'index';
          type: 'u32';
          index: false;
        },
      ];
    },
    {
      name: 'LibraryUpdated';
      fields: [
        {
          name: 'libraryPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'updatedAt';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'LibraryDeleted';
      fields: [
        {
          name: 'libraryPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'MemberRegistered';
      fields: [
        {
          name: 'memberPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'user';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'name';
          type: 'string';
          index: false;
        },
        {
          name: 'tier';
          type: {
            defined: 'MembershipTier';
          };
          index: false;
        },
      ];
    },
    {
      name: 'MemberUpdated';
      fields: [
        {
          name: 'memberPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'user';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'MemberDeleted';
      fields: [
        {
          name: 'memberPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'user';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'BookAdded';
      fields: [
        {
          name: 'bookPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'library';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'title';
          type: 'string';
          index: false;
        },
        {
          name: 'author';
          type: 'string';
          index: false;
        },
        {
          name: 'category';
          type: {
            defined: 'BookCategory';
          };
          index: false;
        },
        {
          name: 'addedBy';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'BookUpdated';
      fields: [
        {
          name: 'bookPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'library';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'updatedAt';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'BookDeleted';
      fields: [
        {
          name: 'bookPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'library';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'BookBorrowed';
      fields: [
        {
          name: 'loanPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'bookPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'member';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'dueDate';
          type: 'i64';
          index: false;
        },
        {
          name: 'rentalFee';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'BookReturned';
      fields: [
        {
          name: 'loanPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'bookPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'member';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'returnedAt';
          type: 'i64';
          index: false;
        },
        {
          name: 'fineAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'BookReserved';
      fields: [
        {
          name: 'reservationPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'bookPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'member';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'expiresAt';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'ReservationCancelled';
      fields: [
        {
          name: 'reservationPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'book';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'member';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'BookReviewed';
      fields: [
        {
          name: 'reviewPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'bookPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'reviewer';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'rating';
          type: 'u8';
          index: false;
        },
        {
          name: 'newAverage';
          type: 'u8';
          index: false;
        },
      ];
    },
    {
      name: 'MembershipRenewed';
      fields: [
        {
          name: 'memberPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'newExpiry';
          type: 'i64';
          index: false;
        },
        {
          name: 'feePaid';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'MembershipUpgraded';
      fields: [
        {
          name: 'memberPubkey';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'oldTier';
          type: {
            defined: 'MembershipTier';
          };
          index: false;
        },
        {
          name: 'newTier';
          type: {
            defined: 'MembershipTier';
          };
          index: false;
        },
        {
          name: 'feePaid';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'FundsWithdrawn';
      fields: [
        {
          name: 'library';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'TitleEmpty';
      msg: 'Title cannot be empty';
    },
    {
      code: 6001;
      name: 'TitleTooLong';
      msg: 'Title too long';
    },
    {
      code: 6002;
      name: 'AuthorEmpty';
      msg: 'Author name cannot be empty';
    },
    {
      code: 6003;
      name: 'AuthorTooLong';
      msg: 'Author name too long';
    },
    {
      code: 6004;
      name: 'CommentTooLong';
      msg: 'Comment too long';
    },
    {
      code: 6005;
      name: 'BookNotAvailable';
      msg: 'Book not available';
    },
    {
      code: 6006;
      name: 'BookStillAvailable';
      msg: 'Book still available for borrowing';
    },
    {
      code: 6007;
      name: 'BookAlreadyReturned';
      msg: 'Book already returned';
    },
    {
      code: 6008;
      name: 'MemberInactive';
      msg: 'Member is inactive';
    },
    {
      code: 6009;
      name: 'MembershipExpired';
      msg: 'Membership has expired';
    },
    {
      code: 6010;
      name: 'RentalPeriodTooLong';
      msg: 'Rental period too long';
    },
    {
      code: 6011;
      name: 'BorrowLimitExceeded';
      msg: 'Borrow limit exceeded';
    },
    {
      code: 6012;
      name: 'InvalidRating';
      msg: 'Invalid rating (must be 1-5)';
    },
    {
      code: 6013;
      name: 'InvalidUpgrade';
      msg: 'Invalid membership upgrade';
    },
    {
      code: 6014;
      name: 'Unauthorized';
      msg: 'Unauthorized';
    },
    {
      code: 6015;
      name: 'InvalidFieldLength';
      msg: 'Invalid field length';
    },
    {
      code: 6016;
      name: 'MismatchedMint';
      msg: 'Mismatched mint';
    },
    {
      code: 6017;
      name: 'MathOverflow';
      msg: 'Math overflow';
    },
    {
      code: 6018;
      name: 'CannotDeleteWithBooks';
      msg: 'Cannot delete library with books';
    },
    {
      code: 6019;
      name: 'CannotDeleteBorrowedBook';
      msg: 'Cannot delete book that is currently borrowed';
    },
    {
      code: 6020;
      name: 'CannotDeleteMemberWithBooks';
      msg: 'Cannot delete member with borrowed books';
    },
    {
      code: 6021;
      name: 'InvalidCopyCount';
      msg: 'Invalid copy count';
    },
    {
      code: 6022;
      name: 'ReservationNotActive';
      msg: 'Reservation is not active';
    },
    {
      code: 6023;
      name: 'InsufficientFunds';
      msg: 'Insufficient funds';
    },
  ];
};

export const IDL: EnhancedDecentralizedLibraryIDLType = {
  version: '0.1.0',
  name: 'enhanced_decentralized_library',
  instructions: [
    {
      name: 'initializeCounter',
      accounts: [
        {
          name: 'counter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeLibrary',
      accounts: [
        {
          name: 'counter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'description',
          type: 'string',
        },
        {
          name: 'membershipFee',
          type: 'u64',
        },
        {
          name: 'lateFeePerDay',
          type: 'u64',
        },
        {
          name: 'maxBorrowDays',
          type: 'u32',
        },
        {
          name: 'paymentMint',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'updateLibrary',
      accounts: [
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'name',
          type: {
            option: 'string',
          },
        },
        {
          name: 'description',
          type: {
            option: 'string',
          },
        },
        {
          name: 'membershipFee',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'lateFeePerDay',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'maxBorrowDays',
          type: {
            option: 'u32',
          },
        },
      ],
    },
    {
      name: 'deleteLibrary',
      accounts: [
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'registerMember',
      accounts: [
        {
          name: 'member',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'libraryTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'email',
          type: 'string',
        },
        {
          name: 'membershipTier',
          type: {
            defined: 'MembershipTier',
          },
        },
      ],
    },
    {
      name: 'updateMember',
      accounts: [
        {
          name: 'member',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'name',
          type: {
            option: 'string',
          },
        },
        {
          name: 'email',
          type: {
            option: 'string',
          },
        },
        {
          name: 'isActive',
          type: {
            option: 'bool',
          },
        },
      ],
    },
    {
      name: 'deleteMember',
      accounts: [
        {
          name: 'member',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'addBook',
      accounts: [
        {
          name: 'book',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'librarian',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'authorName',
          type: 'string',
        },
        {
          name: 'isbn',
          type: 'string',
        },
        {
          name: 'description',
          type: 'string',
        },
        {
          name: 'category',
          type: {
            defined: 'BookCategory',
          },
        },
        {
          name: 'language',
          type: 'string',
        },
        {
          name: 'publisher',
          type: 'string',
        },
        {
          name: 'publicationYear',
          type: 'u16',
        },
        {
          name: 'pages',
          type: 'u16',
        },
        {
          name: 'price',
          type: 'u64',
        },
        {
          name: 'rentalPrice',
          type: 'u64',
        },
        {
          name: 'maxRentalDays',
          type: 'u32',
        },
        {
          name: 'isFree',
          type: 'bool',
        },
        {
          name: 'isNft',
          type: 'bool',
        },
        {
          name: 'fileUrl',
          type: 'string',
        },
        {
          name: 'coverUrl',
          type: 'string',
        },
        {
          name: 'copiesAvailable',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateBook',
      accounts: [
        {
          name: 'book',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'title',
          type: {
            option: 'string',
          },
        },
        {
          name: 'description',
          type: {
            option: 'string',
          },
        },
        {
          name: 'price',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'rentalPrice',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'copiesAvailable',
          type: {
            option: 'u32',
          },
        },
        {
          name: 'isActive',
          type: {
            option: 'bool',
          },
        },
      ],
    },
    {
      name: 'deleteBook',
      accounts: [
        {
          name: 'book',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'borrowBook',
      accounts: [
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'book',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'member',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'libraryTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'rentalDays',
          type: 'u32',
        },
      ],
    },
    {
      name: 'returnBook',
      accounts: [
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'book',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'member',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'libraryTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'reserveBook',
      accounts: [
        {
          name: 'reservation',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'book',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'member',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'libraryTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'priorityFee',
          type: 'u64',
        },
      ],
    },
    {
      name: 'cancelReservation',
      accounts: [
        {
          name: 'reservation',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'book',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'reviewBook',
      accounts: [
        {
          name: 'review',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'book',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'member',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'rating',
          type: 'u8',
        },
        {
          name: 'comment',
          type: 'string',
        },
      ],
    },
    {
      name: 'renewMembership',
      accounts: [
        {
          name: 'member',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'libraryTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'extensionMonths',
          type: 'u32',
        },
      ],
    },
    {
      name: 'upgradeMembership',
      accounts: [
        {
          name: 'member',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'library',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'libraryTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newTier',
          type: {
            defined: 'MembershipTier',
          },
        },
      ],
    },
    {
      name: 'withdrawFunds',
      accounts: [
        {
          name: 'library',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'libraryTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authorityTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'libraryCounter',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'nextIndex',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'library',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'description',
            type: 'string',
          },
          {
            name: 'membershipFee',
            type: 'u64',
          },
          {
            name: 'lateFeePerDay',
            type: 'u64',
          },
          {
            name: 'maxBorrowDays',
            type: 'u32',
          },
          {
            name: 'paymentMint',
            type: 'publicKey',
          },
          {
            name: 'totalBooks',
            type: 'u32',
          },
          {
            name: 'totalMembers',
            type: 'u32',
          },
          {
            name: 'totalRevenue',
            type: 'u64',
          },
          {
            name: 'createdAt',
            type: 'i64',
          },
          {
            name: 'isActive',
            type: 'bool',
          },
          {
            name: 'index',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'member',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'user',
            type: 'publicKey',
          },
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'email',
            type: 'string',
          },
          {
            name: 'membershipTier',
            type: {
              defined: 'MembershipTier',
            },
          },
          {
            name: 'joinedAt',
            type: 'i64',
          },
          {
            name: 'expiresAt',
            type: 'i64',
          },
          {
            name: 'booksBorrowed',
            type: 'u32',
          },
          {
            name: 'totalFines',
            type: 'u64',
          },
          {
            name: 'isActive',
            type: 'bool',
          },
          {
            name: 'reputationScore',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'book',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'library',
            type: 'publicKey',
          },
          {
            name: 'addedBy',
            type: 'publicKey',
          },
          {
            name: 'title',
            type: 'string',
          },
          {
            name: 'authorName',
            type: 'string',
          },
          {
            name: 'isbn',
            type: 'string',
          },
          {
            name: 'description',
            type: 'string',
          },
          {
            name: 'category',
            type: {
              defined: 'BookCategory',
            },
          },
          {
            name: 'language',
            type: 'string',
          },
          {
            name: 'publisher',
            type: 'string',
          },
          {
            name: 'publicationYear',
            type: 'u16',
          },
          {
            name: 'pages',
            type: 'u16',
          },
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'rentalPrice',
            type: 'u64',
          },
          {
            name: 'maxRentalDays',
            type: 'u32',
          },
          {
            name: 'isFree',
            type: 'bool',
          },
          {
            name: 'isNft',
            type: 'bool',
          },
          {
            name: 'fileUrl',
            type: 'string',
          },
          {
            name: 'coverUrl',
            type: 'string',
          },
          {
            name: 'totalCopies',
            type: 'u32',
          },
          {
            name: 'availableCopies',
            type: 'u32',
          },
          {
            name: 'timesBorrowed',
            type: 'u32',
          },
          {
            name: 'addedAt',
            type: 'i64',
          },
          {
            name: 'lastUpdated',
            type: 'i64',
          },
          {
            name: 'isActive',
            type: 'bool',
          },
          {
            name: 'averageRating',
            type: 'u8',
          },
          {
            name: 'totalReviews',
            type: 'u32',
          },
          {
            name: 'ratingSum',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'loan',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'book',
            type: 'publicKey',
          },
          {
            name: 'member',
            type: 'publicKey',
          },
          {
            name: 'library',
            type: 'publicKey',
          },
          {
            name: 'borrowedAt',
            type: 'i64',
          },
          {
            name: 'dueDate',
            type: 'i64',
          },
          {
            name: 'returnedAt',
            type: 'i64',
          },
          {
            name: 'rentalFee',
            type: 'u64',
          },
          {
            name: 'fineAmount',
            type: 'u64',
          },
          {
            name: 'isReturned',
            type: 'bool',
          },
          {
            name: 'isFinePaid',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'reservation',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'book',
            type: 'publicKey',
          },
          {
            name: 'member',
            type: 'publicKey',
          },
          {
            name: 'reservedAt',
            type: 'i64',
          },
          {
            name: 'expiresAt',
            type: 'i64',
          },
          {
            name: 'priorityFee',
            type: 'u64',
          },
          {
            name: 'isActive',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'review',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'book',
            type: 'publicKey',
          },
          {
            name: 'reviewer',
            type: 'publicKey',
          },
          {
            name: 'rating',
            type: 'u8',
          },
          {
            name: 'comment',
            type: 'string',
          },
          {
            name: 'createdAt',
            type: 'i64',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'MembershipTier',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Basic',
          },
          {
            name: 'Premium',
          },
          {
            name: 'VIP',
          },
        ],
      },
    },
    {
      name: 'BookCategory',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Fiction',
          },
          {
            name: 'NonFiction',
          },
          {
            name: 'Science',
          },
          {
            name: 'Technology',
          },
          {
            name: 'History',
          },
          {
            name: 'Biography',
          },
          {
            name: 'Romance',
          },
          {
            name: 'Mystery',
          },
          {
            name: 'Fantasy',
          },
          {
            name: 'SelfHelp',
          },
          {
            name: 'Business',
          },
          {
            name: 'Education',
          },
          {
            name: 'Children',
          },
          {
            name: 'Reference',
          },
          {
            name: 'Other',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'LibraryInitialized',
      fields: [
        {
          name: 'libraryPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'name',
          type: 'string',
          index: false,
        },
        {
          name: 'index',
          type: 'u32',
          index: false,
        },
      ],
    },
    {
      name: 'LibraryUpdated',
      fields: [
        {
          name: 'libraryPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'updatedAt',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'LibraryDeleted',
      fields: [
        {
          name: 'libraryPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'MemberRegistered',
      fields: [
        {
          name: 'memberPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'name',
          type: 'string',
          index: false,
        },
        {
          name: 'tier',
          type: {
            defined: 'MembershipTier',
          },
          index: false,
        },
      ],
    },
    {
      name: 'MemberUpdated',
      fields: [
        {
          name: 'memberPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'MemberDeleted',
      fields: [
        {
          name: 'memberPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'BookAdded',
      fields: [
        {
          name: 'bookPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'library',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'title',
          type: 'string',
          index: false,
        },
        {
          name: 'author',
          type: 'string',
          index: false,
        },
        {
          name: 'category',
          type: {
            defined: 'BookCategory',
          },
          index: false,
        },
        {
          name: 'addedBy',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'BookUpdated',
      fields: [
        {
          name: 'bookPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'library',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'updatedAt',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'BookDeleted',
      fields: [
        {
          name: 'bookPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'library',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'BookBorrowed',
      fields: [
        {
          name: 'loanPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'bookPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'member',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'dueDate',
          type: 'i64',
          index: false,
        },
        {
          name: 'rentalFee',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'BookReturned',
      fields: [
        {
          name: 'loanPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'bookPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'member',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'returnedAt',
          type: 'i64',
          index: false,
        },
        {
          name: 'fineAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'BookReserved',
      fields: [
        {
          name: 'reservationPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'bookPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'member',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'expiresAt',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'ReservationCancelled',
      fields: [
        {
          name: 'reservationPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'book',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'member',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'BookReviewed',
      fields: [
        {
          name: 'reviewPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'bookPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'reviewer',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'rating',
          type: 'u8',
          index: false,
        },
        {
          name: 'newAverage',
          type: 'u8',
          index: false,
        },
      ],
    },
    {
      name: 'MembershipRenewed',
      fields: [
        {
          name: 'memberPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'newExpiry',
          type: 'i64',
          index: false,
        },
        {
          name: 'feePaid',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'MembershipUpgraded',
      fields: [
        {
          name: 'memberPubkey',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'oldTier',
          type: {
            defined: 'MembershipTier',
          },
          index: false,
        },
        {
          name: 'newTier',
          type: {
            defined: 'MembershipTier',
          },
          index: false,
        },
        {
          name: 'feePaid',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'FundsWithdrawn',
      fields: [
        {
          name: 'library',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'TitleEmpty',
      msg: 'Title cannot be empty',
    },
    {
      code: 6001,
      name: 'TitleTooLong',
      msg: 'Title too long',
    },
    {
      code: 6002,
      name: 'AuthorEmpty',
      msg: 'Author name cannot be empty',
    },
    {
      code: 6003,
      name: 'AuthorTooLong',
      msg: 'Author name too long',
    },
    {
      code: 6004,
      name: 'CommentTooLong',
      msg: 'Comment too long',
    },
    {
      code: 6005,
      name: 'BookNotAvailable',
      msg: 'Book not available',
    },
    {
      code: 6006,
      name: 'BookStillAvailable',
      msg: 'Book still available for borrowing',
    },
    {
      code: 6007,
      name: 'BookAlreadyReturned',
      msg: 'Book already returned',
    },
    {
      code: 6008,
      name: 'MemberInactive',
      msg: 'Member is inactive',
    },
    {
      code: 6009,
      name: 'MembershipExpired',
      msg: 'Membership has expired',
    },
    {
      code: 6010,
      name: 'RentalPeriodTooLong',
      msg: 'Rental period too long',
    },
    {
      code: 6011,
      name: 'BorrowLimitExceeded',
      msg: 'Borrow limit exceeded',
    },
    {
      code: 6012,
      name: 'InvalidRating',
      msg: 'Invalid rating (must be 1-5)',
    },
    {
      code: 6013,
      name: 'InvalidUpgrade',
      msg: 'Invalid membership upgrade',
    },
    {
      code: 6014,
      name: 'Unauthorized',
      msg: 'Unauthorized',
    },
    {
      code: 6015,
      name: 'InvalidFieldLength',
      msg: 'Invalid field length',
    },
    {
      code: 6016,
      name: 'MismatchedMint',
      msg: 'Mismatched mint',
    },
    {
      code: 6017,
      name: 'MathOverflow',
      msg: 'Math overflow',
    },
    {
      code: 6018,
      name: 'CannotDeleteWithBooks',
      msg: 'Cannot delete library with books',
    },
    {
      code: 6019,
      name: 'CannotDeleteBorrowedBook',
      msg: 'Cannot delete book that is currently borrowed',
    },
    {
      code: 6020,
      name: 'CannotDeleteMemberWithBooks',
      msg: 'Cannot delete member with borrowed books',
    },
    {
      code: 6021,
      name: 'InvalidCopyCount',
      msg: 'Invalid copy count',
    },
    {
      code: 6022,
      name: 'ReservationNotActive',
      msg: 'Reservation is not active',
    },
    {
      code: 6023,
      name: 'InsufficientFunds',
      msg: 'Insufficient funds',
    },
  ],
};
