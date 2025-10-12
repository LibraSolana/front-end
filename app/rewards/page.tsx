'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Gift, Clock, Stars, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function RewardsComingSoonPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-600 text-white">
      {/* Hiệu ứng glow background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-fuchsia-400/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-rose-400/25 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Nội dung chính */}
      <div className="relative z-10 text-center px-6 space-y-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-medium tracking-wide">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          Rewards Center
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
          Hệ thống phần thưởng <br />
          <span className="text-yellow-300">sắp ra mắt!</span>
        </h1>

        <p className="text-white/90 text-lg md:text-xl leading-relaxed">
          Chuẩn bị nhận những phần thưởng đặc biệt khi đọc, thuê, và chia sẻ tri
          thức.
          <br className="hidden md:block" />
          Nhiệm vụ, cấp bậc và quà tặng đang được hoàn thiện ✨
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button
            size="lg"
            asChild
            className="bg-white text-fuchsia-700 font-semibold hover:bg-white/90 transition-all shadow-lg"
          >
            <Link href="/">Quay lại trang chủ</Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white text-fuchsia-700  hover:bg-white/10 gap-2 transition-all"
          >
            <Clock className="w-4 h-4 animate-spin-slow" />
            Nhắc tôi khi ra mắt
          </Button>
        </div>

        {/* Icon trang trí */}
        <div className="flex justify-center gap-6 pt-10 text-white/70 animate-bounce-slow">
          <Gift className="w-8 h-8" />
          <Stars className="w-8 h-8" />
          <Rocket className="w-8 h-8" />
        </div>
      </div>

      {/* Footer nhỏ */}
      <footer className="absolute bottom-6 text-sm text-white/70">
        © 2025 Decentralized Library — Rewards System v1.0 is coming soon 🚀
      </footer>
    </div>
  );
}
