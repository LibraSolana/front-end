// app/rewards/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

import {
  Gift,
  Trophy,
  Sparkles,
  Star,
  CheckCircle2,
  Flame,
  CalendarClock,
  BookOpen,
  Library as LibraryIcon,
  BadgeDollarSign,
  ArrowRight,
  Coins,
} from 'lucide-react';
import PublicLayout from 'components/layouts/PublicLayout';

type Task = {
  id: string;
  title: string;
  desc: string;
  points: number;
  type: 'daily' | 'weekly' | 'seasonal';
  progress?: number; // 0..100
  done?: boolean;
};

const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Đọc 10 trang',
    desc: 'Mở và đọc nội dung ít nhất 10 trang sách đã mượn',
    points: 10,
    type: 'daily',
    progress: 70,
    done: false,
  },
  {
    id: 't2',
    title: 'Đánh giá sách',
    desc: 'Viết một review chất lượng cho sách đã đọc',
    points: 20,
    type: 'daily',
    progress: 0,
    done: false,
  },
  {
    id: 't3',
    title: 'Mượn 1 cuốn mới',
    desc: 'Thuê 1 sách trong hôm nay',
    points: 15,
    type: 'daily',
    progress: 100,
    done: true,
  },
  {
    id: 't4',
    title: 'Hoàn thành 5 lượt thuê',
    desc: 'Trong tuần này',
    points: 80,
    type: 'weekly',
    progress: 40,
    done: false,
  },
  {
    id: 't5',
    title: 'Mời bạn bè',
    desc: 'Mời 1 người tham gia và mượn sách',
    points: 100,
    type: 'seasonal',
    progress: 0,
    done: false,
  },
];

const mockHistory = [
  { id: 'h1', title: 'Review 5 sao', points: 30, date: '2025-10-02' },
  {
    id: 'h2',
    title: 'Mượn sách: The Great Gatsby',
    points: 15,
    date: '2025-10-01',
  },
  { id: 'h3', title: 'Nhiệm vụ tuần: 3/5', points: 40, date: '2025-09-29' },
];

export default function RewardsPage() {
  const [tab, setTab] = useState<'tasks' | 'history' | 'store'>('tasks');

  const totalPoints = useMemo(() => 1240, []);
  const nextTier = useMemo(() => ({ name: 'Gold', need: 1500 }), []);
  const percentToNext = Math.min(
    100,
    Math.round((totalPoints / nextTier.need) * 100)
  );

  const daily = mockTasks.filter((t) => t.type === 'daily');
  const weekly = mockTasks.filter((t) => t.type === 'weekly');
  const seasonal = mockTasks.filter((t) => t.type === 'seasonal');

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl p-6 space-y-8">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 text-white p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">Rewards Center</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Tích điểm • Nhận quà • Nâng hạng
              </h1>
              <p className="text-white/90">
                Hoàn thành nhiệm vụ khi đọc, thuê và review để nhận điểm thưởng,
                đổi ưu đãi trong cửa hàng.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <BadgeDollarSign className="h-4 w-4" />
                <span>Tổng điểm: {totalPoints.toLocaleString()} pts</span>
              </div>
            </div>
            <div className="min-w-[320px] rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">
                    Tiến độ lên {nextTier.name}
                  </span>
                </div>
                <span className="text-sm">{percentToNext}%</span>
              </div>
              <Progress value={percentToNext} className="h-2 bg-white/30" />
              <div className="mt-2 text-sm text-white/90">
                Cần {nextTier.need - totalPoints} pts nữa để đạt {nextTier.name}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="gap-1">
                  <Flame className="h-4 w-4" /> Nhiệm vụ hot
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20 gap-1"
                >
                  <Star className="h-4 w-4" /> Phần thưởng
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="tasks" className="gap-2">
              <CalendarClock className="h-4 w-4" /> Nhiệm vụ
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Lịch sử
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-2">
              <Gift className="h-4 w-4" /> Đổi quà
            </TabsTrigger>
          </TabsList>

          {/* Tasks */}
          <TabsContent value="tasks" className="space-y-6">
            <TaskSection title="Hằng ngày" items={daily} />
            <TaskSection title="Hằng tuần" items={weekly} />
            <TaskSection title="Mùa giải" items={seasonal} />
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử nhận thưởng</CardTitle>
                <CardDescription>Nhật ký điểm thưởng gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {mockHistory.map((h) => (
                    <div
                      key={h.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="h-4 w-4 text-amber-500" />
                        <div>
                          <div className="font-medium">{h.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {h.date}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">+{h.points} pts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Store */}
          <TabsContent value="store">
            <RewardStore />
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}

function TaskSection({ title, items }: { title: string; items: Task[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button variant="ghost" className="gap-1">
          Xem thêm <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {items.map((t) => (
          <Card key={t.id} className="border-muted-foreground/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{t.title}</span>
                <Badge variant={t.done ? 'default' : 'secondary'}>
                  {t.points} pts
                </Badge>
              </CardTitle>
              <CardDescription>{t.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Progress value={t.progress ?? (t.done ? 100 : 0)} />
                <Button size="sm" disabled={t.done}>
                  {t.done ? 'Đã xong' : 'Làm ngay'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function RewardStore() {
  const items = [
    { id: 'r1', name: 'Voucher miễn phí 1 tuần', cost: 300, tag: 'Hot' },
    { id: 'r2', name: 'Giảm 50% phí thuê 3 lần', cost: 500, tag: 'Deal' },
    { id: 'r3', name: 'Badge độc quyền', cost: 800, tag: 'Exclusive' },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cửa hàng đổi quà</CardTitle>
        <CardDescription>Đổi điểm lấy ưu đãi đặc biệt</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {items.map((x) => (
            <Card key={x.id} className="border-muted-foreground/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{x.name}</CardTitle>
                  <Badge variant="secondary">{x.tag}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {x.cost} pts
                </div>
                <Button size="sm">Claim</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
