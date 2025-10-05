'use client';

import React from 'react';
import PublicLayout from 'components/layouts/PublicLayout';
import BookDetailPage from '@/pages/BookDetailPage';

const Page = () => {
  return (
    <PublicLayout>
      <BookDetailPage />
    </PublicLayout>
  );
};

export default Page;
