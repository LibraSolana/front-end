'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface IpfsUploaderProps {
  accept: string;
  value?: string;
  onChange: (url: string) => void;
}

export default function IpfsUploader({
  accept,
  value,
  onChange,
}: IpfsUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/ipfs', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();

        // backend trả trực tiếp string URL
        if (typeof json === 'string') {
          onChange(json);
        } else {
          console.error('Upload failed', json);
        }
      } catch (err) {
        console.error('IPFS upload error', err);
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept={accept}
        className="hidden"
        id={`ipfs-upload-${accept}`}
        onChange={handleUpload}
      />
      <Button
        type="button"
        onClick={() =>
          document.getElementById(`ipfs-upload-${accept}`)?.click()
        }
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
      </Button>
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 underline"
        >
          View
        </a>
      )}
    </div>
  );
}
