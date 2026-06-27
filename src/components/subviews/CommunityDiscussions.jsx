import React from 'react';

export default function CommunityDiscussions({
  setSelectedCommunityPost
}) {
  return (
    <div className="bg-white border rounded-card p-6 shadow-sm space-y-6 max-w-3xl mx-auto animate-fade-in-up font-sans">
      <div className="flex justify-between items-center border-b border-surface-container-high pb-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-on-surface">Regional Bulletin & Discussions</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Locally relevant warnings, weather updates, and agronomist advisories</p>
        </div>
        <button 
          onClick={() => alert("Creating a new post simulator...")}
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm"
        >
          + Create Post
        </button>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Stem Rust spotted in Wheat crop', author: 'Suresh Patil', location: 'Pimpalgaon (3 km away)', date: 'Today, 10:30 AM', content: 'Hi fellow farmers, I noticed small orange spots on my wheat crop leaves this morning. Agronomist confirmed it is Stem Rust. Please check your fields and take preventive action.', replies: 14, likes: 28 },
          { title: 'Urea fertilizer availability at Cooperative', author: 'Ramesh Sawant', location: 'Nashik District Center', date: 'Yesterday', content: 'Good news! Fresh stock of urea and DAP has arrived at the cooperative society center. Limit is 5 bags per farmer. Bring your Aadhaar Card.', replies: 9, likes: 19 },
          { title: 'Downy Mildew warning in Grape vineyards', author: 'Dr. Vivek Rane (KVK Agronomist)', location: 'Nashik District', date: '2 days ago', content: 'Morning dew and warm afternoon temperatures are extremely conductive for Downy Mildew. Grape farmers should spray Metalaxyl + Mancozeb preventatively.', replies: 31, likes: 62 }
        ].map((post, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedCommunityPost(post)}
            className="p-4 rounded-2xl border border-outline-variant hover:border-primary/40 bg-white cursor-pointer shadow-xs hover:shadow-sm transition-all space-y-2.5"
          >
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-primary">{post.author} ({post.location})</span>
              <span className="text-on-surface-variant text-[10px]">{post.date}</span>
            </div>
            <h4 className="font-bold text-sm text-on-surface leading-tight">{post.title}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {post.content}
            </p>
            <div className="flex gap-4 text-[10px] text-on-surface-variant font-extrabold mt-1">
              <span>💬 {post.replies} Replies</span>
              <span>👍 {post.likes} Likes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
