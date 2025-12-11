'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from 'shared/utils/share';

interface ShareSocialProps {
  url: string;
  title?: string;
  className?: string;
}

export default function ShareSocial({
  url,
  title,
  className,
}: ShareSocialProps) {
  const [copied, setCopied] = useState(false);

  const shareTo = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title || 'Chia sẻ sách hay!');
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
        break;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const onCopy = async () => {
    try {
      await copyToClipboard(url);
      setCopied(true);
      toast.success('Đã sao chép liên kết!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Sao chép thất bại');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => shareTo('facebook')}
        title="Chia sẻ Facebook"
      >
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => shareTo('twitter')}
        title="Chia sẻ Twitter"
      >
        <Twitter className="h-4 w-4 text-sky-500" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => shareTo('linkedin')}
        title="Chia sẻ LinkedIn"
      >
        <Linkedin className="h-4 w-4 text-blue-700" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onCopy}
        title="Sao chép liên kết"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
