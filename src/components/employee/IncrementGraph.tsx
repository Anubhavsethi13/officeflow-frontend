import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Plus } from "lucide-react";
import { useHrStore } from "@/lib/hr-store";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function IncrementGraph({ increments = [] }: { increments?: { date: string, amount: number }[] }) {


  const data = useMemo(() => {
    if (!increments.length) return [];
    const sorted = [...increments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Add current date to extend the line
    const current = { date: new Date().toISOString().slice(0, 10), amount: sorted[sorted.length - 1].amount };
    
    // We only want to add the current date if it's after the last increment date
    const finalData = [...sorted];
    if (new Date(current.date).getTime() > new Date(sorted[sorted.length - 1].date).getTime()) {
      finalData.push(current);
    }
    
    return finalData.map(item => ({
      ...item,
      formattedDate: format(new Date(item.date), "MMM yyyy"),
    }));
  }, [increments]);



  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <TrendingUp className="size-4 text-[color:var(--success)]" />
          Salary Progression
        </div>
      </div>



      {data.length > 0 ? (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
                formatter={(value: number) => [money.format(value), "CTC"]}
                labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
              />
              <Area type="stepAfter" dataKey="amount" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          No increment data available.
        </div>
      )}
    </div>
  );
}
