"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export function AstrologerEarningsChart({ data }: { data: Array<{ name: string; earnings: number; bookings: number }> }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <Tooltip />
          <Bar dataKey="earnings" fill="hsl(var(--secondary))" radius={[5, 5, 0, 0]} />
          <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
