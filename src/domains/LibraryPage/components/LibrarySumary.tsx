import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicKey } from '@solana/web3.js';
import { Wallet, Clock, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

export function LibrarySummary({
  libraryKey,
  library,
}: {
  libraryKey: string;
  library?: any;
}) {
  console.log(library);
  return (
    <Card className="relative max-w-[440px] shadow-md !p-0 !gap-0">
      <Badge
        variant="secondary"
        className="absolute top-2 right-2 rounded-md px-2 py-1 flex items-center gap-1"
      >
        <span className="h-2 w-2 rounded-full bg-green-500"></span>
        {library?.is_active ? 'Active' : 'Inactive'}
      </Badge>

      <CardHeader>
        <img
          alt="library"
          src={'/librarySummary.jpg'}
          className="!rounded-t-xl max-h-[200px] object-cover w-full"
        />
      </CardHeader>

      <CardContent className="!p-4 space-y-2">
        <Link href={`/library/${libraryKey}`}>
          <CardTitle className="text-xl font-bold">
            {library?.name ?? 'Unnamed Library'}
          </CardTitle>
        </Link>

        <p className="text-sm text-muted-foreground">
          {library?.description ?? 'No description available'}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Membership Fee</p>
              <p>
                {library?.membership_fee?.toLocaleString?.() ?? '—'} lamports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Late Fee / Day</p>
              <p>
                {library?.late_fee_per_day?.toLocaleString?.() ?? '—'} lamports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Total Books</p>
              <p>{library?.total_books ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Total Members</p>
              <p>{library?.total_members ?? '—'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
