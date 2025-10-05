'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { usePDADerivation } from './usePDADerivation';
import { Member } from 'shared/utils/solana/types';

export function useMemberData(library?: string, user?: string) {
  const { program, isReady } = useProgram();
  const { deriveMemberPDA } = usePDADerivation();
  const [data, setData] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMember = useCallback(
    async (lib?: string, usr?: string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      if (!lib || !usr) throw new Error('Library and user required');
      setLoading(true);
      try {
        const [memberPDA] = deriveMemberPDA(
          new PublicKey(lib),
          new PublicKey(usr)
        );
        const member = await program.account.member.fetch(memberPDA);
        setData(member as Member);
        return member as Member;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady, deriveMemberPDA]
  );

  useEffect(() => {
    if (library && user && isReady()) fetchMember(library, user);
  }, [library, user, isReady, fetchMember]);

  return { data, loading, fetchMember };
}
