'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useState } from 'react';
import { IDL } from 'shared/types/enhanced_decentralized_library';
import toast from 'react-hot-toast';

const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
);

export const useInitializeLibrary = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeLibrary = async (libraryData: any) => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      //@ts-ignore
      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      });
      const program = new Program(IDL, PROGRAM_ID, provider);

      // 1. Derive counter PDA
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('library_counter'), wallet.publicKey.toBuffer()],
        program.programId
      );

      // 2. Check counter
      let counterAccount;
      try {
        counterAccount = await program.account.libraryCounter.fetch(counterPDA);
      } catch {
        await program.methods
          .initializeCounter()
          .accounts({
            counter: counterPDA,
            authority: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        await new Promise((resolve) => setTimeout(resolve, 2000));
        counterAccount = await program.account.libraryCounter.fetch(counterPDA);
      }

      // 3. Derive library PDA
      const nextIndex = counterAccount.nextIndex;
      const [libraryPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('library'),
          wallet.publicKey.toBuffer(),
          Buffer.from(new Uint8Array(new Uint32Array([nextIndex]).buffer)),
        ],
        program.programId
      );

      // 4. Initialize library
      const tx = await program.methods
        .initializeLibrary(
          libraryData.name,
          libraryData.description,
          new BN(libraryData.membershipFee),
          new BN(libraryData.lateFeePerDay),
          libraryData.maxBorrowDays,
          new PublicKey(libraryData.paymentMint)
        )
        .accounts({
          counter: counterPDA,
          library: libraryPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setLoading(false);

      const successData = {
        success: true,
        signature: tx,
        libraryAddress: libraryPDA.toBase58(),
        index: nextIndex,
      };

      // ✅ Custom toast hiển thị thông tin
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5`}
        >
          <div className="p-4">
            <p className="font-bold text-green-600">✅ Library Created</p>
            <pre className="mt-2 text-xs bg-gray-900 text-white p-2 rounded max-h-40 overflow-auto">
              {JSON.stringify(successData, null, 2)}
            </pre>
            <a
              href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 underline text-xs mt-2 block"
            >
              🔗 View on Solscan (Devnet)
            </a>
          </div>
        </div>
      ));

      return successData;
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
      setLoading(false);

      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5`}
        >
          <div className="p-4">
            <p className="font-bold text-red-600">
              ❌ Error Initializing Library
            </p>
            <pre className="mt-2 text-xs bg-gray-900 text-white p-2 rounded max-h-40 overflow-auto">
              {JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}
            </pre>
          </div>
        </div>
      ));

      throw err;
    }
  };

  return {
    initializeLibrary,
    loading,
    error,
  };
};
