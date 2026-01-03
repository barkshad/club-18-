
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Send, MoreHorizontal, Shield, User as UserIcon, Lock, Fingerprint, Camera, Info } from 'lucide-react';
import { UserProfile, Message } from '../types';

const ChatDetailScreen: React.FC<{chatId: string, onBack: any}> = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser || !chatId) return;

    getDoc(doc(db, "users", auth.currentUser.uid)).then(snap => {
       if (snap.exists()) setCurrentUserProfile({ id: snap.id, ...snap.data() } as UserProfile);
    });

    const uids = chatId.split('--');
    const partnerUid = uids.find(id => id !== auth.currentUser?.uid);

    if (partnerUid) {
      getDoc(doc(db, "users", partnerUid)).then(snap => {
        if (snap.exists()) setPartner({ id: snap.id, ...snap.data() } as UserProfile);
      });
    }

    const q = query(
      collection(db, "messages"), 
      where("matchId", "==", chatId),
      orderBy("timestamp", "asc"), 
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(msgs);
        setLoading(false);
        setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 150);
      },
      (error) => {
        console.error("Chat error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  const uploadToCloudinary = async (f: File) => {
    const formData = new FormData();
    formData.append('file', f);
    formData.append('upload_preset', 'real_unsigned');
    const resourceType = f.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(`https://api.cloudinary.com/v1_1/ds2mbrzcn/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.secure_url;
  };

  const handleSend = async (imageUrl?: string) => {
    if ((!inputText.trim() && !imageUrl) || !auth.currentUser || !partner) return;
    const text = inputText;
    setInputText('');
    
    const messageData: any = {
      text: imageUrl ? '📷 Image' : text,
      senderId: auth.currentUser.uid,
      timestamp: Date.now(),
      matchId: chatId,
      type: imageUrl ? 'image' : 'text'
    };

    if (imageUrl) {
      messageData.image = imageUrl;
    }

    try {
      await addDoc(collection(db, "messages"), messageData);

      if (currentUserProfile) {
        await setDoc(doc(db, "conversations", chatId), {
          participants: [auth.currentUser.uid, partner.id],
          lastMessage: imageUrl ? 'Sent an image' : text,
          timestamp: Date.now(),
          participantData: {
            [auth.currentUser.uid]: {
              name: currentUserProfile.name,
              image: currentUserProfile.image || '',
              username: currentUserProfile.username || ''
            },
            [partner.id]: {
              name: partner.name,
              image: partner.image || '',
              username: partner.username || ''
            }
          }
        }, { merge: true });
      }

    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await handleSend(url);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black fade-in text-white overflow-hidden">
      <header className="px-5 py-4 border-b border-white/5 flex items-center justify-between glass-panel z-10 sticky top-0 shadow-xl">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-white p-1 -ml-1 active:scale-90 transition-transform">
                <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
                    {partner?.image ? <img src={partner.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-900"><UserIcon size={16} className="text-zinc-600" /></div>}
                </div>
                <div className="flex flex-col leading-none">
                    <h2 className="text-[14px] font-bold text-white leading-none">
                      {partner?.name || 'Member'}
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-medium pt-1">@{partner?.username || 'member'}</p>
                </div>
            </div>
        </div>
        <button className="p-2 text-zinc-400 active:scale-90"><Info size={22} /></button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-scrollbar">
        <div className="flex flex-col items-center justify-center py-8 space-y-4 opacity-30 text-center">
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center">
               <Lock size={20} className="text-zinc-600" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 max-w-[200px]">Conversations are encrypted and stored in private club vaults.</p>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          const showTime = i === 0 || (msg.timestamp - messages[i-1].timestamp > 1800000); // 30 mins
          
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showTime && (
                    <div className="w-full text-center py-6">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}
                
                {msg.type === 'image' && msg.image ? (
                   <div 
                      className={`max-w-[80%] rounded-2xl overflow-hidden mb-1 border border-white/5 ${isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}
                   >
                     <img src={msg.image} alt="Attached" className="w-full h-auto" />
                   </div>
                ) : (
                  <div 
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed mb-0.5 ${
                      isMe 
                          ? 'bg-[#8B0000] text-white rounded-br-none' 
                          : 'bg-zinc-900 text-zinc-200 rounded-bl-none border border-white/5'
                      }`}
                  >
                      {msg.text}
                  </div>
                )}
            </div>
          );
        })}
        {isUploading && (
          <div className="flex justify-end pr-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B0000] animate-pulse">Establishing Link...</div>
          </div>
        )}
      </div>

      <div className="p-4 pb-8 border-t border-white/5 glass-panel">
        <div className="flex items-center gap-2 bg-zinc-900 rounded-3xl p-1.5 pl-3 border border-white/5 focus-within:border-zinc-700 transition-all">
            <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                className="flex-1 bg-transparent px-2 py-2 text-[15px] text-white focus:outline-none placeholder:text-zinc-600"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-white hover:text-[#8B0000] transition-colors"
            >
               <Camera size={22} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*"
            />
            {inputText.trim() ? (
              <button 
                  onClick={() => handleSend()} 
                  className="px-4 py-2 text-[#8B0000] font-bold text-[15px] active:scale-95 transition-transform"
              >
                  Send
              </button>
            ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
