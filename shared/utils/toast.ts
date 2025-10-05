// toast.ts
import { toast } from 'react-hot-toast';

export function txLoading(msg = 'Đang gửi giao dịch...') {
  return toast.loading(msg);
}

export function txSuccess(
  sig: string,
  cluster: 'mainnet' | 'devnet' | 'testnet'
) {
  const url =
    cluster === 'mainnet'
      ? `https://solscan.io/tx/${sig}`
      : `https://solscan.io/tx/${sig}?cluster=${cluster}`;
  toast.success(`Thành công: ${sig.slice(0, 8)}...`, {
    id: sig,
  });
  return url;
}

export function txError(err: unknown, stickyId?: string) {
  const msg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as any).message)
      : 'Giao dịch thất bại';
  toast.error(msg, stickyId ? { id: stickyId } : undefined);
}
