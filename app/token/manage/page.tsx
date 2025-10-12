// app/tokens/manage/page.tsx
'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useManageToken } from 'shared/hooks/useManageToken';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { useProgram } from 'shared/hooks/useProgram';
import PublicLayout from 'components/layouts/PublicLayout';

export default function TokenManagePage() {
  const { wallet } = useProgram();
  const { getTokenInfo, mintMore, burnFrom, updateMetadata } = useManageToken();

  const [mintStr, setMintStr] = useState('');
  const [programKind, setProgramKind] = useState<'legacy' | '2022'>('legacy');
  const [info, setInfo] = useState<{
    decimals?: number;
    supply?: string;
    metadataPda?: string;
    hasMetadata?: boolean;
  } | null>(null);

  const [mintAmount, setMintAmount] = useState<string>('0');
  const [burnAmount, setBurnAmount] = useState<string>('0');

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [uri, setUri] = useState('');

  const tokenProgram =
    programKind === '2022' ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

  const onLoad = async () => {
    try {
      const mint = new PublicKey(mintStr);
      const { mintAcc, metadataPda, hasMetadata } = await getTokenInfo(
        mint,
        tokenProgram
      );
      setInfo({
        decimals: mintAcc.decimals,
        supply: mintAcc.supply.toString(),
        metadataPda: metadataPda.toBase58(),
        hasMetadata,
      });
    } catch (e: any) {
      alert(e.message || 'Không thể tải thông tin token');
    }
  };

  const onMint = async () => {
    if (!wallet?.publicKey) return alert('Chưa kết nối ví');
    try {
      const mint = new PublicKey(mintStr);
      const decimals = info?.decimals ?? 0;
      const amount = BigInt(Math.round(Number(mintAmount) * 10 ** decimals));
      const ata = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey,
        true,
        tokenProgram
      );
      await mintMore(mint, ata, amount, tokenProgram);
      await onLoad();
    } catch (e: any) {
      alert(e.message || 'Mint thất bại');
    }
  };

  const onBurn = async () => {
    if (!wallet?.publicKey) return alert('Chưa kết nối ví');
    try {
      const mint = new PublicKey(mintStr);
      const decimals = info?.decimals ?? 0;
      const amount = BigInt(Math.round(Number(burnAmount) * 10 ** decimals));
      const ata = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey,
        true,
        tokenProgram
      );
      await burnFrom(mint, ata, amount, tokenProgram);
      await onLoad();
    } catch (e: any) {
      alert(e.message || 'Burn thất bại');
    }
  };

  const onUpdateMetadata = async () => {
    try {
      const mint = new PublicKey(mintStr);
      await updateMetadata(mint, { name, symbol, uri });
      await onLoad();
    } catch (e: any) {
      alert(e.message || 'Cập nhật metadata thất bại');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-[1fr,180px] gap-3">
            <div>
              <Label>Địa chỉ mint</Label>
              <Input
                placeholder="Nhập địa chỉ mint"
                value={mintStr}
                onChange={(e) => setMintStr(e.target.value)}
              />
            </div>
            <div>
              <Label>Chuẩn</Label>
              <Select
                value={programKind}
                onValueChange={(v) => setProgramKind(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chuẩn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legacy">SPL Legacy</SelectItem>
                  <SelectItem value="2022">Token-2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={onLoad}>Tải thông tin</Button>

          {info && (
            <>
              <Separator />
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Decimals:</span>{' '}
                  {info.decimals}
                </div>
                <div>
                  <span className="text-muted-foreground">Supply:</span>{' '}
                  {info.supply}
                </div>
                <div>
                  <span className="text-muted-foreground">Metadata PDA:</span>{' '}
                  <span className="font-mono break-all">
                    {info.metadataPda}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Metadata tồn tại:
                  </span>{' '}
                  {info.hasMetadata ? 'Có' : 'Không'}
                </div>
              </div>

              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mint thêm</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Số token"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                    />
                    <Button onClick={onMint}>Mint</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Nhập theo đơn vị token, hệ thống sẽ quy đổi theo decimals.
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Burn</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Số token"
                      value={burnAmount}
                      onChange={(e) => setBurnAmount(e.target.value)}
                    />
                    <Button variant="destructive" onClick={onBurn}>
                      Burn
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cần sở hữu token ở ATA để burn.
                  </div>
                </div>
              </div>

              <Separator />
              <div className="space-y-2">
                <Label>Cập nhật Metadata</Label>
                <div className="grid sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Tên (name)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    placeholder="Symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  />
                  <Input
                    placeholder="URI (https://.../metadata.json)"
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={onUpdateMetadata}>Cập nhật</Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  URI trỏ tới JSON metadata theo chuẩn Metaplex.
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
