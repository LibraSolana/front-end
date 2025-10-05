// src/lib/books/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import {
  addBook,
  updateBook,
  deleteBook,
  fetchBook,
  fetchBooksByLibrary,
  AddBookArgs,
  UpdateBookArgs,
} from './service';
import { toast } from 'sonner';

// Query Keys
export const qk = {
  root: ['books'] as const,
  allBooks: (library: string) => [...qk.root, 'all', library] as const,
  oneBook: (book: string) => [...qk.root, 'one', book] as const,
};

// ---- HOOKS ----

function useBooks(program: Program | null, library: PublicKey | null) {
  return useQuery({
    queryKey: qk.allBooks(library?.toBase58() ?? 'nil'),
    enabled: !!program && !!library,
    queryFn: async () => fetchBooksByLibrary(program!, library!),
  });
}

function useBook(program: Program | null, book: PublicKey | null) {
  return useQuery({
    queryKey: qk.oneBook(book?.toBase58() ?? 'nil'),
    enabled: !!program && !!book,
    queryFn: () => fetchBook(program!, book!),
  });
}

function useCreateBook(
  program: Program | null,
  library: PublicKey | null,
  librarian: PublicKey | null
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: AddBookArgs) => {
      if (!program || !library || !librarian) throw new Error('Missing deps');
      const bookPk = await addBook(program, library, librarian, args);
      return { bookPk, args };
    },
    onMutate: async (vars) => {
      toast.loading('Creating book...');
      const key = qk.allBooks(library!.toBase58());
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<any[]>(key);

      const optimistic = {
        publicKey: null,
        account: {
          library: library,
          title: vars.title,
          authorName: vars.authorName,
          isActive: true,
        },
      };

      qc.setQueryData<any[]>(key, (old) =>
        old ? [optimistic, ...old] : [optimistic]
      );

      return { prev, key };
    },
    onError: (e, _vars, ctx) => {
      toast.error(`Create failed: ${e.message}`);
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSuccess: () => {
      toast.success('Book created successfully!');
    },
    onSettled: async () => {
      toast.dismiss();
      if (library) {
        await qc.invalidateQueries({
          queryKey: qk.allBooks(library.toBase58()),
        });
      }
    },
  });
}

function useUpdateBook(
  program: Program | null,
  library: PublicKey | null,
  authority: PublicKey | null,
  book: PublicKey | null
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: UpdateBookArgs) => {
      if (!program || !library || !authority || !book)
        throw new Error('Missing deps');
      await updateBook(program, book, library, authority, args);
      return args;
    },
    onMutate: async (vars) => {
      toast.loading('Updating book...');
      const keyOne = qk.oneBook(book!.toBase58());
      const keyAll = qk.allBooks(library!.toBase58());
      await qc.cancelQueries({ queryKey: keyOne });
      await qc.cancelQueries({ queryKey: keyAll });

      const prevOne = qc.getQueryData<any>(keyOne);
      const prevAll = qc.getQueryData<any[]>(keyAll);

      qc.setQueryData<any>(keyOne, (old: any) =>
        old ? { ...old, ...vars } : old
      );
      qc.setQueryData<any[]>(keyAll, (old) =>
        old?.map((i) =>
          i?.publicKey?.toBase58?.() === book!.toBase58()
            ? { ...i, account: { ...i.account, ...vars } }
            : i
        )
      );

      return { prevOne, prevAll, keyOne, keyAll };
    },
    onError: (e, _vars, ctx) => {
      toast.error(`Update failed: ${e.message}`);
      if (ctx?.prevOne) qc.setQueryData(ctx.keyOne, ctx.prevOne);
      if (ctx?.prevAll) qc.setQueryData(ctx.keyAll, ctx.prevAll);
    },
    onSuccess: () => {
      toast.success('Book updated!');
    },
    onSettled: async () => {
      toast.dismiss();
      if (book)
        await qc.invalidateQueries({ queryKey: qk.oneBook(book.toBase58()) });
      if (library)
        await qc.invalidateQueries({
          queryKey: qk.allBooks(library.toBase58()),
        });
    },
  });
}

function useDeleteBook(
  program: Program | null,
  library: PublicKey | null,
  authority: PublicKey | null,
  book: PublicKey | null
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!program || !library || !authority || !book)
        throw new Error('Missing deps');
      await deleteBook(program, book, library, authority);
    },
    onMutate: async () => {
      toast.loading('Deleting book...');
      const keyAll = qk.allBooks(library!.toBase58());
      await qc.cancelQueries({ queryKey: keyAll });
      const prevAll = qc.getQueryData<any[]>(keyAll);

      qc.setQueryData<any[]>(keyAll, (old) =>
        old?.filter((i) => i?.publicKey?.toBase58?.() !== book!.toBase58())
      );

      return { prevAll, keyAll };
    },
    onError: (e, _v, ctx) => {
      toast.error(`Delete failed: ${e.message}`);
      if (ctx?.prevAll) qc.setQueryData(ctx.keyAll, ctx.prevAll);
    },
    onSuccess: () => {
      toast.success('Book deleted!');
    },
    onSettled: async () => {
      toast.dismiss();
      if (library)
        await qc.invalidateQueries({
          queryKey: qk.allBooks(library.toBase58()),
        });
    },
  });
}

// ---- EXPORT GỌN ----
export const BooksApi = {
  useBooks,
  useBook,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
};
