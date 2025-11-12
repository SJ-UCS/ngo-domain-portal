import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [participations, setParticipations] = useState({ donations: [], volunteers: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchParticipations();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      alert('Failed to load profile. Please login again.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipations = async () => {
    try {
      const response = await api.get('/auth/profile/participations');
      setParticipations(response.data);
    } catch (error) {
      console.error('Failed to fetch participations:', error);
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  if (!user) {
    return <div className="card">User not found</div>;
  }

  const totalCampaigns = new Set([
    ...participations.donations.map(d => d.campaign_id),
    ...participations.volunteers.map(v => v.campaign_id)
  ]).size;

  const totalDonated = participations.donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  return (
    <div>
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="text-6xl">{user.profile_icon || '👤'}</div>
          <div className="flex-1">
            <h2>{user.name}</h2>
            <p className="text-secondary">{user.email}</p>
            {user.role && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm mt-2">
                {user.role.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{totalCampaigns}</div>
          <div className="text-sm text-secondary mt-1">Campaigns Participated</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{participations.donations.length}</div>
          <div className="text-sm text-secondary mt-1">Donations Made</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">₹{totalDonated.toLocaleString()}</div>
          <div className="text-sm text-secondary mt-1">Total Donated</div>
        </div>
      </div>

      <div className="card">
        <h3>Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {user.age && (
            <div>
              <strong>Age:</strong> {user.age}
            </div>
          )}
          {user.mobile && (
            <div>
              <strong>Mobile:</strong> {user.mobile}
            </div>
          )}
          {user.area && (
            <div>
              <strong>Area:</strong> {user.area}
            </div>
          )}
          {user.created_at && (
            <div>
              <strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {participations.donations.length > 0 && (
        <div className="card">
          <h3>My Donations ({participations.donations.length})</h3>
          <div className="space-y-3 mt-4">
            {participations.donations.map(donation => (
              <div key={donation.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{donation.campaign_title}</h4>
                    <p className="text-sm text-secondary">{donation.ngo_name}</p>
                    <p className="text-xs text-muted mt-1">
                      Donated on: {new Date(donation.donated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ₹{parseFloat(donation.amount).toLocaleString()}
                    </div>
                    <Link 
                      to={`/ngos/${donation.ngo_id}`} 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View NGO
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {participations.volunteers.length > 0 && (
        <div className="card">
          <h3>My Volunteer Applications ({participations.volunteers.length})</h3>
          <div className="space-y-3 mt-4">
            {participations.volunteers.map(volunteer => (
              <div key={volunteer.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{volunteer.campaign_title}</h4>
                    <p className="text-sm text-secondary">{volunteer.ngo_name}</p>
                    <p className="text-xs text-muted mt-1">
                      Applied on: {new Date(volunteer.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      volunteer.status === 'approved' ? 'bg-green-100 text-green-800' :
                      volunteer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {volunteer.status}
                    </span>
                    <div className="mt-2">
                      <Link 
                        to={`/ngos/${volunteer.ngo_id}`} 
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View NGO
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {participations.donations.length === 0 && participations.volunteers.length === 0 && (
        <div className="card text-center">
          <p className="text-secondary">You haven't participated in any campaigns yet.</p>
          <Link to="/ngos" className="btn btn-primary mt-4 inline-block">
            Browse NGOs
          </Link>
        </div>
      )}
    </div>
  );
}

