import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Flag, 
  Trophy, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface Stats {
  activeCampaigns: number;
  totalParticipants: number;
  totalWinners: number;
}

const data = [
  { name: "Mon", participants: 40 },
  { name: "Tue", participants: 30 },
  { name: "Wed", participants: 65 },
  { name: "Thu", participants: 45 },
  { name: "Fri", participants: 90 },
  { name: "Sat", participants: 120 },
  { name: "Sun", participants: 85 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Dashboard stats fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  const statCards = [
    { 
      label: "Active Campaigns", 
      value: stats?.activeCampaigns || 0, 
      icon: Flag, 
      color: "bg-blue-500",
      trend: "+12%",
      isUp: true
    },
    { 
      label: "Total Participants", 
      value: stats?.totalParticipants || 0, 
      icon: Users, 
      color: "bg-emerald-500",
      trend: "+24%",
      isUp: true
    },
    { 
      label: "Total Winners", 
      value: stats?.totalWinners || 0, 
      icon: Trophy, 
      color: "bg-amber-500",
      trend: "+5%",
      isUp: true
    },
    { 
      label: "Conversion Rate", 
      value: stats ? ((stats.totalWinners / stats.totalParticipants) * 100).toFixed(1) + "%" : "0%", 
      icon: TrendingUp, 
      color: "bg-purple-500",
      trend: "-2%",
      isUp: false
    },
  ];

  if (isLoading) return <div className="animate-pulse space-y-8">
    <div className="h-8 w-48 bg-slate-200 rounded"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
    </div>
  </div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.color} text-white`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${card.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{card.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Participation Trend</h2>
              <p className="text-sm text-slate-500">Number of participants over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
              <button className="px-3 py-1.5 text-xs font-medium bg-white text-slate-900 rounded-lg shadow-sm">Weekly</button>
              <button className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">Monthly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="participants" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPart)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Upcoming Events</h2>
          <div className="space-y-6">
            {[
              { name: "Marathon 2024", date: "Mar 15, 2024", type: "Offline" },
              { name: "Tennis Open", date: "Apr 02, 2024", type: "Tournament" },
              { name: "Kids Sports Day", date: "Apr 10, 2024", type: "Fun Event" },
            ].map((event, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{event.name}</h4>
                  <p className="text-sm text-slate-500">{event.date} • {event.type}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors">
            View Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
