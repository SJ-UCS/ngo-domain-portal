import React, {useEffect, useState} from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

// NGO Profile component with campaign creation and volunteer features

export default function NGOProfile(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }

    // Get NGO details
    api.get(`/ngos/${id}`)
      .then(r => {
        setNgo(r.data);
        const savedUser = localStorage.getItem('user');
        if (savedUser && r.data.owner_id) {
          const userData = JSON.parse(savedUser);
          // Compare as strings to handle type mismatch, only if owner_id exists
          const isOwnerCheck = String(r.data.owner_id) === String(userData.id);
          setIsOwner(isOwnerCheck);
          if (isOwnerCheck) {
            // Load volunteer applications if owner
            loadVolunteers();
          }
        } else {
          // No user logged in or no owner_id, so not owner
          setIsOwner(false);
        }
      })
      .catch(() => {
        // Fallback to old method
        api.get('/ngos').then(r => {
          const found = r.data.find(x => String(x.id) === id);
          setNgo(found || null);
          if (found) {
            const savedUser = localStorage.getItem('user');
            if (savedUser && found.owner_id) {
              const userData = JSON.parse(savedUser);
              // Compare as strings to handle type mismatch, only if owner_id exists
              setIsOwner(String(found.owner_id) === String(userData.id));
            } else {
              setIsOwner(false);
            }
          }
        });
      });

    // Get campaigns
    api.get(`/campaigns/ngo/${id}`)
      .then(r => setCampaigns(r.data))
      .catch(() => {
        // Fallback
        api.get('/campaigns').then(r => {
          setCampaigns(r.data.filter(c => String(c.ngo_id) === id));
        });
      });
  }, [id]);

  const loadVolunteers = () => {
    api.get(`/campaigns/volunteers/ngo/${id}`)
      .then(r => setVolunteers(r.data))
      .catch(err => {
        console.error('Failed to load volunteers:', err);
      });
  };

  const handleVolunteer = async (campaignId) => {
    if (!user) {
      alert('Please login to apply as a volunteer');
      navigate('/login');
      return;
    }

    setLoading({ ...loading, [campaignId]: true });
    try {
      const response = await api.post(`/ngos/${id}/campaigns/${campaignId}/volunteer`);
      alert(response.data.message);
      // Show notification info if available
      if (response.data.notification) {
        console.log('Notification for NGO:', response.data.notification);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply as volunteer');
    } finally {
      setLoading({ ...loading, [campaignId]: false });
    }
  };

  if(!ngo) return <div className="card">Loading...</div>;
  
  // Only show warning if user is logged in, NGO has an owner, and user is NOT the owner
  const shouldShowWarning = user && ngo.owner_id && !isOwner;
  
  return (
    <div>
      {shouldShowWarning && (
        <div className="card mb-3" style={{backgroundColor: '#fef3c7', border: '1px solid #fbbf24'}}>
          <p className="text-sm">
            <strong>Note:</strong> You're viewing someone else's NGO. 
            {user.role === 'ngo' && (
              <span> To add campaigns, visit <Link to="/ngos" className="text-blue-600 underline">your own NGO profile</Link>.</span>
            )}
          </p>
        </div>
      )}
      
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h2>{ngo.name}</h2>
            <p className="text-secondary">{ngo.description}</p>
            <div className="mt-2">
              {ngo.domain && <span className="text-sm"><strong>Domain:</strong> {ngo.domain}</span>}
              {ngo.location && <span className="text-sm ml-3"><strong>Location:</strong> {ngo.location}</span>}
            </div>
            {ngo.contact && (
              <div className="mt-2 text-sm"><strong>Contact:</strong> {ngo.contact}</div>
            )}
          </div>
          {isOwner && (
            <Link to="/add-campaign" className="btn btn-primary">
              + Add Campaign
            </Link>
          )}
        </div>
      </div>

      {isOwner && volunteers.length > 0 && (
        <div className="card">
          <h3>Volunteer Applications</h3>
          <div className="space-y-2">
            {volunteers.map(v => (
              <div key={v.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{v.user_name}</div>
                    <div className="text-sm text-secondary">
                      Applied for: <strong>{v.campaign_title}</strong>
                    </div>
                    <div className="text-xs text-muted mt-1">
                      Applied on: {new Date(v.applied_at).toLocaleDateString()}
                    </div>
                    {v.user_email && (
                      <div className="text-xs text-muted">Email: {v.user_email}</div>
                    )}
                    {v.user_mobile && (
                      <div className="text-xs text-muted">Mobile: {v.user_mobile}</div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    v.status === 'approved' ? 'bg-green-100 text-green-800' :
                    v.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Campaigns</h3>
        {campaigns.length === 0 && (
          <p className="text-secondary">No campaigns yet.</p>
        )}
        {campaigns.map(c => (
          <div key={c.id} className="card mb-3">
            <h4>{c.title}</h4>
            <p className="text-secondary">{c.description}</p>
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm">
                {c.goal_amount > 0 && (
                  <span>Goal: ₹{parseFloat(c.goal_amount).toLocaleString()} • </span>
                )}
                Collected: ₹{parseFloat(c.collected_amount || 0).toLocaleString()}
              </div>
              <div className="flex gap-2">
                {user && !isOwner && (
                  <button
                    onClick={() => handleVolunteer(c.id)}
                    disabled={loading[c.id]}
                    className="btn btn-secondary text-sm"
                  >
                    {loading[c.id] ? 'Applying...' : 'Apply as Volunteer'}
                  </button>
                )}
                <Link to={`/donate/${c.id}`} className="btn btn-primary text-sm">
                  Donate
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
