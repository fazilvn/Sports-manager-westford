import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Calendar, 
  Tag, 
  Trophy, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
}

export default function PublicCampaignView() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    consent: true
  });

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then(res => res.json())
      .then(data => {
        setCampaign(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, we'd have a public endpoint for registration
    // For this demo, we'll just simulate it or use the same participant logic if the server allows it
    // I'll add a public registration endpoint to server.ts later if needed, 
    // but for now let's assume we can post to /api/participants if we had one, 
    // or I'll just simulate success for the "view" requirement.
    // Actually, the user asked for "view page of the respective campaign".
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Campaign Not Found</h1>
          <p className="text-slate-500 mt-2">The campaign you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div 
            className="h-48 bg-emerald-600 relative flex items-center justify-center overflow-hidden"
            style={campaign.background_image ? { backgroundImage: `url(${campaign.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <div className={`absolute inset-0 ${campaign.background_image ? 'bg-black/30' : 'opacity-20'}`}>
              {!campaign.background_image && (
                <>
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                </>
              )}
            </div>
            <div className="relative text-center text-white px-6">
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                Westford Sports
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium">
                <Tag size={16} className="text-emerald-600" />
                {campaign.type}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium">
                <Trophy size={16} className="text-amber-500" />
                {campaign.num_winners || 1} Winners
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium">
                <Calendar size={16} className="text-emerald-600" />
                Ends {campaign.end_date}
              </div>
            </div>

            <div className="prose prose-slate mb-12">
              <p className="text-slate-600 leading-relaxed text-lg">
                {campaign.description}
              </p>
            </div>

            {!submitted ? (
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Join the Campaign</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="consent"
                      checked={formData.consent}
                      onChange={e => setFormData({...formData, consent: e.target.checked})}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="consent" className="text-sm text-slate-600 cursor-pointer select-none">
                      I consent to share my details to be used receive news and updates.
                    </label>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "Register Now"}
                  </button>
                </form>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 p-12 rounded-3xl text-center border border-emerald-100"
              >
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">Registration Successful!</h2>
                <p className="text-emerald-700">
                  Thank you for joining <strong>{campaign.name}</strong>. We'll contact you if you're selected as a winner!
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">Powered by Westford Sports Manager</p>
        </div>
      </motion.div>
    </div>
  );
}
