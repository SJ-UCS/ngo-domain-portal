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
  
  const totalCollected = campaigns.reduce((sum, c) => sum + parseFloat(c.collected_amount || 0), 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + parseFloat(c.goal_amount || 0), 0);
  
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
      
      {/* NGO Profile Header */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2>{ngo.name}</h2>
            <p className="text-secondary">{ngo.description}</p>
            
            {isOwner && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-sm text-secondary">Domain:</strong>
                  <div className="text-lg">{ngo.domain || 'Not specified'}</div>
                </div>
                <div>
                  <strong className="text-sm text-secondary">Location:</strong>
                  <div className="text-lg">{ngo.location || 'Not specified'}</div>
                </div>
                {ngo.contact && (
                  <div>
                    <strong className="text-sm text-secondary">Contact:</strong>
                    <div className="text-lg">{ngo.contact}</div>
                  </div>
                )}
                {ngo.objectives && (
                  <div>
                    <strong className="text-sm text-secondary">Objectives:</strong>
                    <div className="text-sm mt-1">{ngo.objectives}</div>
                  </div>
                )}
              </div>
            )}
            
            {!isOwner && (
              <div className="mt-2">
                {ngo.domain && <span className="text-sm"><strong>Domain:</strong> {ngo.domain}</span>}
                {ngo.location && <span className="text-sm ml-3"><strong>Location:</strong> {ngo.location}</span>}
                {ngo.contact && (
                  <div className="mt-2 text-sm"><strong>Contact:</strong> {ngo.contact}</div>
                )}
              </div>
            )}
          </div>
          {isOwner && (
            <Link to="/add-campaign" className="btn btn-primary ml-4">
              + Add Campaign
            </Link>
          )}
        </div>
      </div>

      {/* Statistics for NGO Owner */}
      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">{campaigns.length}</div>
            <div className="text-sm text-secondary mt-1">Total Campaigns</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">{volunteers.length}</div>
            <div className="text-sm text-secondary mt-1">Volunteer Applications</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600">₹{totalCollected.toLocaleString()}</div>
            <div className="text-sm text-secondary mt-1">Total Collected</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-orange-600">₹{totalGoal.toLocaleString()}</div>
            <div className="text-sm text-secondary mt-1">Total Goal</div>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Volunteer Applications</h3>
            {volunteers.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {volunteers.length} application{volunteers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {volunteers.length === 0 ? (
            <p className="text-secondary">No volunteer applications yet.</p>
          ) : (
            <div className="space-y-3">
              {volunteers.map(v => (
                <div key={v.id} className="p-4 bg-gray-50 rounded border hover:bg-gray-100 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xl">👤</div>
                        <div>
                          <div className="font-semibold text-lg">{v.user_name}</div>
                          <div className="text-xs text-muted">
                            Applied on: {new Date(v.applied_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="ml-8">
                        <div className="text-sm text-secondary mb-2">
                          <strong>Campaign:</strong> {v.campaign_title}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {v.user_email && (
                            <div>
                              <strong>Email:</strong> 
                              <a href={`mailto:${v.user_email}`} className="text-blue-600 hover:underline ml-1">
                                {v.user_email}
                              </a>
                            </div>
                          )}
                          {v.user_mobile && (
                            <div>
                              <strong>Mobile:</strong> 
                              <a href={`tel:${v.user_mobile}`} className="text-blue-600 hover:underline ml-1">
                                {v.user_mobile}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        v.status === 'approved' ? 'bg-green-100 text-green-800' :
                        v.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3>Campaigns {isOwner && `(${campaigns.length})`}</h3>
          {isOwner && campaigns.length === 0 && (
            <Link to="/add-campaign" className="btn btn-primary text-sm">
              Create Your First Campaign
            </Link>
          )}
        </div>
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-secondary mb-4">No campaigns yet.</p>
            {isOwner && (
              <Link to="/add-campaign" className="btn btn-primary">
                + Add Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => {
              const progress = c.goal_amount > 0 ? (c.collected_amount / c.goal_amount) * 100 : 0;
              return (
                <div key={c.id} className="p-4 bg-gray-50 rounded border hover:bg-gray-100 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold">{c.title}</h4>
                      <p className="text-secondary text-sm mt-1">{c.description}</p>
                      {c.goal_amount > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-secondary mb-1">
                            <span>Progress</span>
                            <span>{Math.min(progress, 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4 mt-3 text-sm">
                        {c.goal_amount > 0 && (
                          <div>
                            <span className="text-secondary">Goal: </span>
                            <span className="font-semibold">₹{parseFloat(c.goal_amount).toLocaleString()}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-secondary">Collected: </span>
                          <span className="font-semibold text-green-600">₹{parseFloat(c.collected_amount || 0).toLocaleString()}</span>
                        </div>
                        {c.created_at && (
                          <div className="text-xs text-muted">
                            Created: {new Date(c.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
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
                    {isOwner && (
                      <Link to={`/ngos/${id}`} className="btn btn-secondary text-sm">
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
