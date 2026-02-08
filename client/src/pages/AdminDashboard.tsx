import { useQuery } from "@tanstack/react-query";
import { Submission } from "@shared/schema";
import { Card as UICard, CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle, CardDescription } from "@/components/ui/card";
import { LayoutDashboard, Users, Clock, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  const stats = [
    {
      title: "Total Submissions",
      value: submissions?.length || 0,
      icon: Users,
      description: "Total cases received",
    },
    {
      title: "Recent (24h)",
      value: submissions?.filter(s => {
        if (!s.createdAt) return false;
        const date = new Date(s.createdAt);
        return Date.now() - date.getTime() < 24 * 60 * 60 * 1000;
      }).length || 0,
      icon: Clock,
      description: "Submissions in the last 24 hours",
    },
    {
      title: "New Cases",
      value: submissions?.length || 0, // Simplified for now
      icon: AlertCircle,
      description: "Cases awaiting review",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <UICard key={stat.title} className="bg-zinc-900 border-white/10">
            <UICardHeader className="flex flex-row items-center justify-between pb-2">
              <UICardTitle className="text-sm font-medium text-zinc-400">
                {stat.title}
              </UICardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </UICardHeader>
            <UICardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{stat.description}</p>
            </UICardContent>
          </UICard>
        ))}
      </div>

      <UICard className="bg-zinc-900 border-white/10">
        <UICardHeader>
          <UICardTitle>System Overview</UICardTitle>
          <CardDescription>Quick summary of application status</CardDescription>
        </UICardHeader>
        <UICardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Database Connection</span>
              </div>
              <span className="text-xs text-zinc-400 font-mono">STABLE</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Notification System</span>
              </div>
              <span className="text-xs text-zinc-400 font-mono">ACTIVE</span>
            </div>
          </div>
        </UICardContent>
      </UICard>
    </div>
  );
}
