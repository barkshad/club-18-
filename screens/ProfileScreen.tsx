
import React, { useState } from 'react';
import { Camera, Settings, Shield, LogOut, Edit3, Check } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Exploring the intersections of art, technology, and good conversation. Always looking for the next great story.");

  return (
    <div className="flex flex-col min-h-full">
      {/* Profile Header */}
      <div className="relative h-96 w-full">
        <img 
          src="https://picsum.photos/seed/myprofile/600/900" 
          alt="My Profile" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <h1 className="text-lg font-bold tracking-tight">My Club Profile</h1>
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
            <Settings size={20} />
          </button>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
           <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold">Alex, 29</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="px-2 py-0.5 bg-white text-black text-[10px] font-bold rounded uppercase tracking-widest">Premium Member</div>
                  <span className="text-zinc-400 text-xs">New York, US</span>
                </div>
              </div>
              <button className="w-12 h-12 rounded-full bg-[#C41E3A] flex items-center justify-center shadow-lg shadow-[#C41E3A]/40">
                <Camera size={20} />
              </button>
           </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 py-6 border-b border-zinc-900 bg-zinc-950">
        <div className="text-center border-r border-zinc-900">
           <span className="block text-lg font-bold">128</span>
           <span className="text-[10px] text-zinc-500 uppercase font-medium">Profile Likes</span>
        </div>
        <div className="text-center border-r border-zinc-900">
           <span className="block text-lg font-bold">42</span>
           <span className="text-[10px] text-zinc-500 uppercase font-medium">Active Matches</span>
        </div>
        <div className="text-center">
           <span className="block text-lg font-bold">Gold</span>
           <span className="text-[10px] text-zinc-500 uppercase font-medium">Status</span>
        </div>
      </div>

      {/* Bio Section */}
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">About Me</h3>
           <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-[#C41E3A] text-xs font-bold flex items-center gap-1"
            >
              {isEditing ? <><Check size={14} /> SAVE</> : <><Edit3 size={14} /> EDIT</>}
           </button>
        </div>

        {isEditing ? (
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-[#C41E3A]/50"
            rows={4}
          />
        ) : (
          <p className="text-sm text-zinc-400 leading-relaxed italic">
            "{bio}"
          </p>
        )}

        <div className="mt-10 space-y-4">
          <h3 className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Account Excellence</h3>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-900">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-[#C41E3A]">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold">Verification Center</h4>
              <p className="text-[10px] text-zinc-500">Increase trust with ID verification.</p>
            </div>
            <button className="text-xs font-bold text-zinc-400 underline uppercase tracking-tighter">Start</button>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-4 text-zinc-700 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest mt-6">
            <LogOut size={16} /> Log Out from Club
          </button>
        </div>
      </div>
      
      {/* Bottom Padding for Safe Area */}
      <div className="h-20" />
    </div>
  );
};

export default ProfileScreen;
