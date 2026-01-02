
import React, { useState } from 'react';
import { Settings, Shield, LogOut, Edit3, Check, Grid, Bookmark, User as UserIcon } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Architect of desire. Looking for deep conversations and midnight adventures. Minimalist, espresso enthusiast, traveler.");
  const [activeTab, setActiveTab] = useState<'grid' | 'saved' | 'tagged'>('grid');

  return (
    <div className="flex flex-col min-h-full bg-black">
      {/* IG Style Profile Header */}
      <header className="px-4 py-4 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur-md z-10">
        <h2 className="text-lg font-black tracking-tighter">alex_verified_18</h2>
        <div className="flex gap-6">
          <Settings size={22} className="text-white" strokeWidth={1.5} />
        </div>
      </header>

      {/* Profile Info Section */}
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center gap-10">
          <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#8B0000] to-zinc-700">
             <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
                <img 
                  src="https://picsum.photos/seed/myprofile/400" 
                  alt="My Profile" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
          <div className="flex flex-1 justify-around text-center">
             <div>
               <span className="block text-base font-black">1,402</span>
               <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Reach</span>
             </div>
             <div>
               <span className="block text-base font-black">84</span>
               <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Matches</span>
             </div>
             <div>
               <span className="block text-base font-black">Elite</span>
               <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Status</span>
             </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black flex items-center gap-1">
            Alex, 29
            <Shield size={12} className="text-[#8B0000]" fill="currentColor" />
          </h3>
          <p className="text-[11px] text-zinc-500 mb-2 uppercase tracking-tight">Luxury Designer • NYC</p>
          
          {isEditing ? (
            <textarea 
              autoFocus
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 focus:outline-none focus:border-[#8B0000]/50"
              rows={3}
            />
          ) : (
            <p className="text-xs text-zinc-300 leading-relaxed font-light">
              {bio}
            </p>
          )}
          
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-full mt-6 py-2 bg-zinc-900 text-white rounded-md text-[11px] font-black tracking-widest flex items-center justify-center gap-2 border border-zinc-800 uppercase"
          >
            {isEditing ? <><Check size={14} /> Finish Editing</> : <><Edit3 size={14} /> Edit Profile</>}
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex border-t border-zinc-900">
        <button 
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-3 flex justify-center items-center border-t-2 transition-colors ${activeTab === 'grid' ? 'border-white text-white' : 'border-transparent text-zinc-600'}`}
        >
          <Grid size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 flex justify-center items-center border-t-2 transition-colors ${activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-zinc-600'}`}
        >
          <Bookmark size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('tagged')}
          className={`flex-1 py-3 flex justify-center items-center border-t-2 transition-colors ${activeTab === 'tagged' ? 'border-white text-white' : 'border-transparent text-zinc-600'}`}
        >
          <UserIcon size={20} />
        </button>
      </div>

      {/* Profile Grid (Placeholder for user's own photos) */}
      <div className="grid grid-cols-3 gap-[1px] bg-zinc-900 mb-20">
        {[1,2,3,4,5,6,7,8,9].map(i => (
          <div key={i} className="aspect-square bg-zinc-950">
            <img 
              src={`https://picsum.photos/seed/profile-post-${i}/300`} 
              alt={`Post ${i}`} 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        ))}
      </div>

      {/* Logout / Account Settings Footer */}
      <div className="px-8 pb-10 text-center">
          <button className="flex items-center justify-center gap-2 py-4 text-zinc-800 hover:text-[#8B0000] transition-colors text-[10px] font-black uppercase tracking-[0.3em]">
            <LogOut size={14} /> Exit Private Club
          </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
