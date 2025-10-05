// components/forms/AddBookForm.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

const currentYear = new Date().getFullYear();
const LAMPORTS_PER_SOL = 1_000_000_000;

const schema: yup.ObjectSchema<any> = yup
  .object({
    title: yup.string().min(2).max(200).required('Title required'),
    authorName: yup.string().min(2).max(100).required('Author required'),
    isbn: yup.string().max(20).notRequired().default(undefined),
    description: yup.string().max(2000).notRequired().default(undefined),
    language: yup.string().max(50).notRequired().default(undefined),
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
      .default(undefined),
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

const PRICE_PRESETS_SOL = ['0', '0.1', '0.25', '0.5', '1', '2', '5'];

export function AddBookForm({ library, onSuccess }: AddBookFormProps) {
  const { addBook, loading } = useBookOperations();
  const [result, setResult] = useState<any>(null);

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
      price: undefined,
      rentalPrice: undefined,
      maxRentalDays: 14,
      isFree: false,
      isNft: false,
      fileUrl: undefined,
      coverUrl: undefined,
      copiesAvailable: 1,
    },
  });

  const isFree = form.watch('isFree');

  // Helpers chuyển preset SOL -> lamports
  const setPriceFromSol = (solStr: string) => {
    const sol = Number(solStr);
    if (Number.isFinite(sol))
      form.setValue('price', Math.round(sol * LAMPORTS_PER_SOL), {
        shouldValidate: true,
      });
  };
  const setRentalFromSol = (solStr: string) => {
    const sol = Number(solStr);
    if (Number.isFinite(sol))
      form.setValue('rentalPrice', Math.round(sol * LAMPORTS_PER_SOL), {
        shouldValidate: true,
      });
  };

  const onSubmit = async (data: AddBookFormData) => {
    try {
      const res = await addBook(library, data);
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Book title" {...field} />
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
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="Author name" {...field} />
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
                  <FormLabel>Language</FormLabel>
                  <Select
                    value={field.value as any}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANG_OPTIONS.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value as any}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(BookCategory).map((cat) => (
                        <SelectItem key={String(cat)} value={String(cat)}>
                          {String(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short synopsis..." {...field} />
                  </FormControl>
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
              <Info className="h-5 w-5" /> Chi tiết & Giá
            </CardTitle>
            <CardDescription>
              ISBN, nhà xuất bản, năm phát hành, trang và giá
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
                  <FormLabel>Publisher</FormLabel>
                  <FormControl>
                    <Input placeholder="Publisher" {...field} />
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
                  <FormLabel>Publication Year</FormLabel>
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
                  <FormLabel>Pages</FormLabel>
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
                  <FormLabel>Copies Available</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxRentalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Rental Days</FormLabel>
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
                          <Coins className="h-4 w-4" /> Price (lamports)
                        </FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
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
                          <Select onValueChange={setPriceFromSol}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="SOL" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRICE_PRESETS_SOL.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v} SOL
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Chọn preset theo SOL để tự quy đổi sang lamports.
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
                          <Coins className="h-4 w-4" /> Rental/day (lamports)
                        </FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
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
                          <Select onValueChange={setRentalFromSol}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="SOL" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRICE_PRESETS_SOL.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v} SOL
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Phí thuê mỗi ngày; để trống nếu miễn phí thuê.
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
                    <FormLabel>Free Book</FormLabel>
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
                  <FormLabel>Cover Image</FormLabel>
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
                  <FormLabel>Book File (PDF/EPUB)</FormLabel>
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
            {loading ? 'Adding...' : 'Add Book'}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>

        {result && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              ✅ Book added: {result.book?.toBase58?.() ?? String(result.book)}
            </p>
            <p>📝 TX: {result.signature}</p>
            {result.explorerUrl && (
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                View on Explorer
              </a>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}
