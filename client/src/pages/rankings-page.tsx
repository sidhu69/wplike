import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Coins } from 'lucide-react';
import type { Ranking, CoinPrize } from '@shared/schema';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'annual';

export default function RankingsPage() {
  const [period, setPeriod] = useState<PeriodType>('daily');

  const { data: rankings, isLoading } = useQuery<Ranking[]>({
    queryKey: ['/api/rankings', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_rankings', {
        period_type: period,
      });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: prizes } = useQuery<CoinPrize[]>({
    queryKey: ['/api/coin-prizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_prizes')
        .select('*')
        .order('period_type');

      if (error) throw error;
      return data;
    },
  });

  const currentPrize = prizes?.find(p => p.period_type === period);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'h-20 bg-primary/5';
    if (rank === 2 || rank === 3) return 'h-18 bg-muted/50';
    return 'h-14';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Prize Display */}
      {currentPrize && (
        <Card className="m-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                {period.charAt(0).toUpperCase() + period.slice(1)} Champion Prize
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>1st: {currentPrize.first_place}</span>
                <span>•</span>
                <span>2nd: {currentPrize.second_place}</span>
                <span>•</span>
                <span>3rd: {currentPrize.third_place}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-8 h-8 text-primary" />
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodType)} className="flex-1 flex flex-col">
        <TabsList className="mx-4 grid grid-cols-4">
          <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual" data-testid="tab-annual">Annual</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="flex-1 overflow-y-auto mt-0 px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2 mt-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : rankings && rankings.length > 0 ? (
            <div className="space-y-2 mt-4">
              {rankings.slice(0, 50).map((ranking) => (
                <Card
                  key={ranking.user_id}
                  className={`flex items-center gap-3 p-3 ${getRankStyle(ranking.rank)}`}
                  data-testid={`rank-item-${ranking.rank}`}
                >
                  <div className="w-8 flex items-center justify-center">
                    {getMedalIcon(ranking.rank) || (
                      <span className={`font-bold ${ranking.rank <= 3 ? 'text-xl' : 'text-base'}`}>
                        {ranking.rank}
                      </span>
                    )}
                  </div>

                  <Avatar className={ranking.rank <= 3 ? 'w-12 h-12' : 'w-10 h-10'}>
                    <AvatarImage src={ranking.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(ranking.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${ranking.rank <= 3 ? 'text-base' : 'text-sm'}`}>
                      {ranking.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {ranking.message_count} messages
                    </p>
                  </div>

                  {ranking.rank <= 3 && currentPrize && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {ranking.rank === 1 && currentPrize.first_place}
                      {ranking.rank === 2 && currentPrize.second_place}
                      {ranking.rank === 3 && currentPrize.third_place}
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No rankings available yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
