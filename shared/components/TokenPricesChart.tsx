'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';

interface TokenData {
  id: string;
  symbol: string;
  name: string;
  history: { time: number; price: number }[];
  currentPrice: number;
  priceChange24h: number;
}

interface TokenPricesChartProps {
  tokenIds: string[]; // e.g. ['solana', 'ethereum']
}

export function TokenPricesChart({ tokenIds }: TokenPricesChartProps) {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);
        const results: TokenData[] = [];
        for (const id of tokenIds) {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
          );
          const data = await res.json();
          const history = data.market_data.sparkline_7d.price.map(
            (price: number, idx: number) => ({
              time: Date.now() - 6 * 24 * 60 * 60 * 1000 + idx * 60 * 60 * 1000,
              price,
            })
          );
          results.push({
            id: data.id,
            symbol: data.symbol.toUpperCase(),
            name: data.name,
            history,
            currentPrice: data.market_data.current_price.usd,
            priceChange24h: data.market_data.price_change_percentage_24h,
          });
        }
        setTokens(results);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch token data');
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, [tokenIds]);

  if (loading) return <p>Loading token prices...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {tokens.map((token) => (
        <div
          key={token.id}
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">
              {token.name} ({token.symbol})
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                ${token.currentPrice.toFixed(2)}
              </span>
              <Badge
                variant={token.priceChange24h >= 0 ? 'default' : 'destructive'}
                className="text-sm"
              >
                {token.priceChange24h.toFixed(2)}%
              </Badge>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={token.history}>
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                labelFormatter={(val) => new Date(val).toLocaleString()}
                formatter={(value) => [
                  `$${(value as number).toFixed(2)}`,
                  'Price',
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={token.priceChange24h >= 0 ? '#4ade80' : '#f87171'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
