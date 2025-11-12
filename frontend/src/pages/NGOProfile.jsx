import React, {useEffect, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function NGOProfile(){
  const { id } = useParams();
  const [ngo,setNgo] = useState(null);
  const [campaigns,setCampaigns] = useState([]);
  useEffect(()=>{
    api.get('/ngos').then(r=>{
      const found = r.data.find(x=>String(x.id)===id);
      setNgo(found||null);
    });
    api.get('/campaigns').then(r=>{
      setCampaigns(r.data.filter(c=>String(c.ngo_id)===id || String(c.ngo_id)===String(id)));
    });
  },[id]);
  if(!ngo) return <div className="card">Loading...</div>;
  return (
    <div>
      <div className="card">
        <h2>{ngo.name}</h2>
        <p>{ngo.description}</p>
        <div><strong>Domain:</strong> {ngo.domain} • <strong>Location:</strong> {ngo.location}</div>
      </div>
      <div className="card">
        <h3>Campaigns</h3>
        {campaigns.length===0 && <p className="muted">No campaigns yet.</p>}
        {campaigns.map(c=>(
          <div key={c.id} className="card">
            <h4>{c.title}</h4>
            <p>{c.description}</p>
            <div className="flex">
              <div>Goal: {c.goal_amount} • Collected: {c.collected_amount}</div>
              <div style={{marginLeft:'auto'}}><Link to={'/donate/'+c.id} className="btn">Donate</Link></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
