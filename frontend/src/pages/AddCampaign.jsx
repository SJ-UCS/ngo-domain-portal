import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AddCampaign() {
  const [ngos, setNgos] = useState([]);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's NGOs
    api.get('/ngos')
      .then(res => {
        const userNgos = res.data.filter(ngo => {
          // Check if current user owns this NGO
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          return ngo.owner_id === user.id;
        });
        setNgos(userNgos);
        if (userNgos.length === 1) {
          setSelectedNgoId(userNgos[0].id.toString());
        }
      })
      .catch(err => {
        console.error('Failed to fetch NGOs:', err);
        alert('Failed to load your NGOs. Please make sure you are logged in and have created an NGO.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedNgoId || !title || !description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/campaigns', {
        ngo_id: parseInt(selectedNgoId),
        title,
        description,
        goal_amount: parseFloat(goalAmount) || 0
      });
      alert('Campaign created successfully!');
      navigate(`/ngos/${selectedNgoId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  if (ngos.length === 0) {
    return (
      <div className="card">
        <h2>Create Campaign</h2>
        <p className="text-secondary">
          You need to create an NGO first before you can create campaigns.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/ngos')}>
          Go to NGOs
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Create New Campaign</h2>
      <p className="text-secondary mb-4">Add a new campaign for your NGO to raise funds and attract volunteers.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="font-semibold mb-2 block">Select NGO *</label>
          <select
            value={selectedNgoId}
            onChange={(e) => setSelectedNgoId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Choose an NGO</option>
            {ngos.map(ngo => (
              <option key={ngo.id} value={ngo.id}>
                {ngo.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="font-semibold mb-2 block">Campaign Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter campaign title"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="font-semibold mb-2 block">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe your campaign, its goals, and how it will make a difference"
            rows="5"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="font-semibold mb-2 block">Goal Amount (Optional)</label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="Enter target amount (e.g., 10000)"
            min="0"
            step="0.01"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

