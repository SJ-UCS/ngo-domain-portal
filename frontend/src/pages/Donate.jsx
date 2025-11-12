import React, {useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Donate(){
  const { campaignId } = useParams();
  const [amount,setAmount] = useState('');
  const navigate = useNavigate();

  const doDonate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/donations', { campaign_id: campaignId, amount });
      alert('Thanks for donating!');
      navigate('/ngos');
    } catch (err) {
      alert('Donation failed. Make sure you are logged in.');
    }
  };

  return (
    <div className="card">
      <h3>Donate to Campaign #{campaignId}</h3>
      <form onSubmit={doDonate}>
        <label>Amount</label>
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} required />
        <button className="btn" type="submit">Donate</button>
      </form>
    </div>
  );
}
