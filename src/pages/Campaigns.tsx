import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Filter, MoreVertical, Calendar, Tag, CheckCircle2, Clock } from "lucide-react";

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "upcoming">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        setCampaigns(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Campaigns fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredCampaigns = campaigns.filter(c => 
    c.status === activeTab && 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500">Manage your offline sports campaigns and events.</p>
        </div>
        <button 
          onClick={() => navigate("/campaigns/create")}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create Campaign
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
            ))
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {campaign.status}
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{campaign.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6">{campaign.description}</p>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Tag size={16} className="text-slate-400" />
                    <span>{campaign.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{campaign.start_date} - {campaign.end_date}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      +12
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="text-emerald-600 text-sm font-semibold hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No campaigns found</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
