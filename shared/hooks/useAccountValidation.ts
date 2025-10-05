'use client';

import { useCallback } from 'react';
import { Member } from 'shared/utils/solana/types';

export function useAccountValidation() {
  const ensureActiveMember = useCallback((member: Member) => {
    if (!member.isActive) throw new Error('Member inactive');
    const now = Math.floor(Date.now() / 1000);
    if (Number(member.expiresAt) <= now) throw new Error('Membership expired');
    return true;
  }, []);

  return { ensureActiveMember };
}
