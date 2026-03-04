import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Eye, 
  Trophy, 
  Calendar, 
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Spin and Win",
    status: "upcoming",
    start_date: "",
    end_date: "",
    num_winners: 1,
    winner_positions: ["1st Place"],
    selection_type: "spin_and_win",
    background_image: ""
  });

  const handleAddPosition = () => {
    setFormData({
      ...formData,
      winner_positions: [...formData.winner_positions, `Position ${formData.winner_positions.length + 1}`]
    });
  };

  const handleRemovePosition = (index: number) => {
    const newPositions = formData.winner_positions.filter((_, i) => i !== index);
    setFormData({ ...formData, winner_positions: newPositions });
  };

  const handlePositionChange = (index: number, value: string) => {
    const newPositions = [...formData.winner_positions];
    newPositions[index] = value;
    setFormData({ ...formData, winner_positions: newPositions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/campaigns/${data.id}`);
      } else {
        alert("Failed to create campaign");
      }
    } catch (error) {
      alert("Error creating campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, background_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/campaigns")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Campaigns
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all"
          >
            <Eye size={18} />
            {showPreview ? "Edit Form" : "Preview Page"}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Create Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <AnimatePresence mode="wait">
          {!showPreview ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Settings size={20} className="text-emerald-600" />
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Title</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="e.g. Summer Sports Fest 2024"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-32"
                      placeholder="Describe your campaign..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" />
                  Winner Settings
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Number of Winners</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.num_winners}
                      onChange={e => setFormData({ ...formData, num_winners: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Selection Type</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.selection_type}
                      onChange={e => setFormData({ ...formData, selection_type: e.target.value })}
                    >
                      <option value="automatic">Automatic Selection</option>
                      <option value="spin_and_win">Spin and Win</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Winner Positions</label>
                  {formData.winner_positions.map((pos, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text"
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                        value={pos}
                        onChange={e => handlePositionChange(idx, e.target.value)}
                      />
                      <button 
                        onClick={() => handleRemovePosition(idx)}
                        className="p-2 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddPosition}
                    className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    <Plus size={16} />
                    Add Position
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-500" />
                  Participation Period
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.end_date}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon size={20} className="text-purple-500" />
                  Campaign Branding
                </h2>
                
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Background Image</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                      {formData.background_image ? (
                        <img src={formData.background_image} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-10 h-10 mb-3 text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-slate-400">PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {formData.background_image && (
                    <button 
                      onClick={() => setFormData({ ...formData, background_image: "" })}
                      className="text-sm text-red-500 font-medium hover:text-red-600"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-2"
            >
              <div className="bg-slate-100 p-8 rounded-[3rem] border border-slate-200 shadow-inner min-h-[800px]">
                <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div 
                    className="h-64 bg-emerald-600 relative flex items-center justify-center overflow-hidden"
                    style={formData.background_image ? { backgroundImage: `url(${formData.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {!formData.background_image && (
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                      </div>
                    )}
                    <div className="relative text-center text-white px-6 bg-black/20 backdrop-blur-sm p-6 rounded-3xl">
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                        Westford Sports
                      </div>
                      <h1 className="text-4xl font-bold tracking-tight">{formData.name || "Campaign Title"}</h1>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">
                    <div className="flex flex-wrap gap-4 mb-8">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium">
                        <Trophy size={16} className="text-amber-500" />
                        {formData.num_winners} Winners
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium">
                        <Calendar size={16} className="text-emerald-600" />
                        Ends {formData.end_date || "YYYY-MM-DD"}
                      </div>
                    </div>

                    <div className="prose prose-slate mb-12">
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {formData.description || "Campaign description will appear here..."}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                      <h2 className="text-xl font-bold text-slate-900 mb-6">Join the Campaign</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                          <div className="h-12 bg-white border border-slate-100 rounded-xl px-4 flex items-center text-slate-300 text-sm">John Doe</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                            <div className="h-12 bg-white border border-slate-100 rounded-xl px-4 flex items-center text-slate-300 text-sm">john@example.com</div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                            <div className="h-12 bg-white border border-slate-100 rounded-xl px-4 flex items-center text-slate-300 text-sm">+1 234 567 890</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 py-1">
                          <div className="w-4 h-4 rounded border border-emerald-500 bg-emerald-500 flex items-center justify-center mt-0.5">
                            <CheckCircle2 size={10} className="text-white" />
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            I consent to share my details to be used receive news and updates.
                          </p>
                        </div>
                        <div className="h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100">
                          Register Now
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-slate-400 text-sm font-medium">PREVIEW MODE</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Sidebar (only visible in edit mode) */}
        {!showPreview && (
          <div className="space-y-6">
            <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-lg shadow-emerald-100">
              <h3 className="text-xl font-bold mb-4">Quick Tips</h3>
              <ul className="space-y-4 text-emerald-50 text-sm">
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span>Use a high-quality background image to make your campaign stand out.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span>Clearly define the winner positions to build excitement.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span>The "Spin and Win" type adds an interactive wheel to the public page.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Selection Type</span>
                  <span className="font-medium text-slate-900 capitalize">{formData.selection_type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Winners</span>
                  <span className="font-medium text-slate-900">{formData.num_winners}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium text-slate-900">
                    {formData.start_date && formData.end_date ? "Set" : "Not Set"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
