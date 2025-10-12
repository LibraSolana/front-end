// components/forms/AddBookForm.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import { useBookOperations } from 'shared/hooks/useBooks';
import IpfsUploader from 'shared/forms/IpfsUploader';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { AddBookFormData, BookCategory } from 'shared/types/types';
import {
  Image as ImageIcon,
  Upload,
  Loader2,
  Info,
  BookOpen,
  Coins,
  Languages,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getMint,
} from '@solana/spl-token';

const currentYear = new Date().getFullYear();
const PCOIN_MINT = 'HwBgz6m8XGAC3jJHYsLP2wdbm7b2NF8k9rhFianPGzRZ';

const schema: yup.ObjectSchema<any> = yup
  .object({
    title: yup.string().min(2).max(200).required('Title required'),
    authorName: yup.string().min(2).max(100).required('Author required'),
    isbn: yup.string().max(20).notRequired().default(undefined),
    description: yup.string().max(2000).notRequired().default(undefined),
    language: yup.string().max(50).notRequired().default('vi'),
    publisher: yup.string().max(100).notRequired().default(undefined),
    category: yup
      .mixed()
      .oneOf(Object.values(BookCategory) as any)
      .required('Category required'),
    publicationYear: yup
      .number()
      .transform((v, o) => (o === '' || o == null ? undefined : Number(v)))
      .min(1)
      .max(currentYear)
      .notRequired()
      .default(undefined),
    pages: yup
      .number()
      .transform((v, o) => (o === '' || o == null ? undefined : Number(v)))
      .min(1)
      .notRequired()
      .default(undefined),
    maxRentalDays: yup
      .number()
      .transform((v, o) => (o === '' || o == null ? undefined : Number(v)))
      .min(1)
      .max(365)
      .notRequired()
      .default(14),
    // Giá nhập theo PCOIN UI, sẽ convert sang raw ở onSubmit
    price: yup
      .number()
      .transform((v, o) => (o === '' || o == null ? undefined : Number(v)))
      .when('isFree', {
        is: false,
        then: (s) => s.min(0).required('Price required when not free'),
        otherwise: (s) => s.notRequired().default(undefined),
      }),
    rentalPrice: yup
      .number()
      .transform((v, o) => (o === '' || o == null ? undefined : Number(v)))
      .min(0)
      .notRequired()
      .default(undefined),
    isFree: yup.boolean().required(),
    isNft: yup.boolean().required(),
    copiesAvailable: yup
      .number()
      .transform((v, o) => (o === '' || o == null ? 1 : Number(v)))
      .min(1)
      .required('Copies required'),
    fileUrl: yup.string().url('Invalid URL').notRequired().default(undefined),
    coverUrl: yup.string().url('Invalid URL').notRequired().default(undefined),
  })
  .required();

interface AddBookFormProps {
  library: PublicKey;
  onSuccess?: (result: any) => void;
}

const LANG_OPTIONS = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ru', label: 'Русский' },
  { code: 'pt', label: 'Português' },
];

export function AddBookForm({ library, onSuccess }: AddBookFormProps) {
  const { addBook, loading } = useBookOperations();
  const [result, setResult] = useState<any>(null);

  const { connection } = useConnection();
  const [pcoinDecimals, setPcoinDecimals] = useState<number>(6);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const mintPk = new PublicKey(PCOIN_MINT);
        const info = await connection.getAccountInfo(mintPk);
        const program =
          info && info.owner.equals(TOKEN_2022_PROGRAM_ID)
            ? TOKEN_2022_PROGRAM_ID
            : TOKEN_PROGRAM_ID;
        const mintAcc = await getMint(connection, mintPk, 'confirmed', program);
        if (!abort) setPcoinDecimals(mintAcc.decimals);
      } catch {
        if (!abort) setPcoinDecimals(6);
      }
    })();
    return () => {
      abort = true;
    };
  }, [connection]);

  const form = useForm<AddBookFormData>({
    resolver: yupResolver(schema) as unknown as Resolver<AddBookFormData, any>,
    defaultValues: {
      title: '',
      authorName: '',
      isbn: undefined,
      description: undefined,
      category: (Object.values(BookCategory)[0] as any) ?? 'Other',
      language: 'vi',
      publisher: undefined,
      publicationYear: undefined,
      pages: undefined,
      price: undefined, // UI PCOIN (số thập phân)
      rentalPrice: undefined, // UI PCOIN
      maxRentalDays: 14,
      isFree: false,
      isNft: false,
      fileUrl: undefined,
      coverUrl: undefined,
      copiesAvailable: 1,
    },
  });

  const isFree = form.watch('isFree');

  // Helpers: UI PCOIN -> raw units
  const toRaw = (ui?: number | null) => {
    if (ui == null || Number.isNaN(ui)) return undefined;
    return Math.round(Number(ui) * 10 ** pcoinDecimals);
  };

  const onSubmit = async (data: AddBookFormData) => {
    try {
      const payload: AddBookFormData = {
        ...data,
        // chuyển giá từ đơn vị PCOIN UI sang raw units
        price: data.isFree ? 0 : (toRaw(data.price as any) ?? 0),
        rentalPrice:
          data.rentalPrice != null ? toRaw(data.rentalPrice as any) : undefined,
      };
      const res = await addBook(library, payload);
      setResult(res);
      onSuccess?.(res);
      form.reset();
    } catch (error) {
      console.error('Add book error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header note */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>
            Thông tin sẽ được ghi on-chain sau khi xác nhận giao dịch.
          </span>
        </div>

        {/* Section 1: Basic */}
        <Card>
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Thông tin cơ bản
            </CardTitle>
            <CardDescription>
              Tiêu đề, tác giả, mô tả, ngôn ngữ và phân loại
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên sách" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tác giả</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên tác giả" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngôn ngữ</FormLabel>
                  <div className="relative">
                    <select
                      className="w-full border rounded-md h-10 px-3 bg-background"
                      value={field.value as any}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {LANG_OPTIONS.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phân loại</FormLabel>
                  <div className="relative">
                    <select
                      className="w-full border rounded-md h-10 px-3 bg-background"
                      value={field.value as any}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {Object.values(BookCategory).map((cat) => (
                        <option key={String(cat)} value={String(cat)}>
                          {String(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tóm tắt nội dung..." {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Viết mô tả ngắn gọn, tối đa 2000 ký tự.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 2: Details & Pricing */}
        <Card>
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" /> Chi tiết & Giá (PCOIN)
            </CardTitle>
            <CardDescription>
              ISBN, nhà xuất bản, năm phát hành, trang và giá (đơn vị PCOIN)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input placeholder="ISBN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhà xuất bản</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhà xuất bản" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publicationYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm phát hành</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={currentYear}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số trang</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="copiesAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bản có sẵn</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Số lượng bản có thể cho mượn/mua ngay.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxRentalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày thuê tối đa</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="md:col-span-3" />

            <div className="md:col-span-3 grid sm:grid-cols-2 gap-4">
              {!isFree && (
                <>
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Coins className="h-4 w-4" /> Giá mua (PCOIN)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.000001"
                            placeholder="Ví dụ: 1.5"
                            value={(field.value as any) ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Nhập theo đơn vị PCOIN; hệ thống sẽ tự quy đổi sang
                          raw units theo decimals {pcoinDecimals}.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rentalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Coins className="h-4 w-4" /> Giá thuê/ngày (PCOIN)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.000001"
                            placeholder="Ví dụ: 0.2"
                            value={(field.value as any) ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Để trống nếu không hỗ trợ thuê; tính phí theo ngày tối
                          đa {form.getValues('maxRentalDays') ?? 14} ngày.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel>Sách miễn phí</FormLabel>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isNft"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel>NFT</FormLabel>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Media & IPFS */}
        <Card>
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Media & IPFS
            </CardTitle>
            <CardDescription>
              Upload ảnh bìa và file sách lên IPFS, tự điền URL
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh bìa</FormLabel>
                  <div className="flex items-center gap-3">
                    <Input placeholder="https://..." {...field} />
                    <IpfsUploader
                      accept="image/*"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                  {field.value && (
                    <div className="mt-2 w-40 h-56 border rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={field.value}
                        alt="Book Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File sách (PDF/EPUB)</FormLabel>
                  <div className="flex items-center gap-3">
                    <Input placeholder="https://..." {...field} />
                    <IpfsUploader
                      accept=".pdf,.epub"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Đang thêm...' : 'Thêm sách'}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Đặt lại
          </Button>
        </div>

        {result && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              ✅ Đã thêm sách:{' '}
              {result.book?.toBase58?.() ?? String(result.book)}
            </p>
            <p>📝 TX: {result.signature}</p>
            {result.explorerUrl && (
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                Xem trên Explorer
              </a>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}
