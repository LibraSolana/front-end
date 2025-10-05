import Link from 'next/link';
import { CircleDollarSign, Gem, User } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolBalance } from 'shared/hooks/useGetBalance';
import { useTokenBalance } from 'shared/hooks/useGetTokenBalance';

interface WalletCardProps {
  name: string;
  avatar: string;
  ddlMint: string; // địa chỉ token DDL mint
}

export default function WalletCard({ ddlMint }: WalletCardProps) {
  const { publicKey } = useWallet();
  const sol = useSolBalance();
  const ddl = useTokenBalance(ddlMint);

  //empty
  if (!publicKey) return null;

  return (
    <Link href={'/my-books'}>
      <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm w-fit cursor-pointer mb-4 hover:shadow-md transition">
        {/* Avatar */}
        <div className="w-14 h-14 overflow-hidden rounded-full border-1 flex justify-center items-center">
          <User width={40} height={40} />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Gem size={16} className="text-gray-700" />
            <span>{sol !== null ? sol.toFixed(2) : '…'} SOL</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CircleDollarSign size={16} className="text-gray-700" />
            <span>{ddl !== null ? ddl.toLocaleString() : '0'} DDL</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
