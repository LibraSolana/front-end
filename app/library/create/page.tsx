'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { InitializeSection } from 'shared/components/library/InitializeSection';
import { CreateLibraryForm } from 'shared/components/library/CreateLibraryForm';
import { LibrariesByAuthority } from 'shared/components/library/LibrariesByAuthority';

import { LibraryBig, Rocket, ListChecks } from 'lucide-react';

export default function LibraryPage() {
  const { publicKey, connected } = useWallet();

  return (
    <main className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">
      <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white/95 backdrop-blur-sm p-6">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LibraryBig className="w-7 h-7 text-indigo-600" />
            Libraries
          </CardTitle>
          <CardDescription className="text-base text-gray-500 mt-1">
            Manage your decentralized libraries and track borrowing rules
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-10 pt-6">
          {/* Create form */}
          {connected && (
            <section className="p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800">
                <LibraryBig className="w-5 h-5 text-blue-600" />
                Create New Library
              </h2>
              <CreateLibraryForm />
            </section>
          )}

          {/* List */}
          <section className="p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800">
              <ListChecks className="w-5 h-5 text-purple-600" />
              My Libraries
            </h2>
            {/* @ts-ignore */}
            <LibrariesByAuthority authority={publicKey} />
          </section>

          {/* Section init */}
          <section className="p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800">
              <Rocket className="w-5 h-5 text-green-600" />
              Initialize Counter
            </h2>
            <InitializeSection />
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
