import React, {useEffect, useState} from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function NGOs(){
  const [ngos,setNgos] = useState([]);
  const [myNgos, setMyNgos] = useState([]);
  const [user, setUser] = useState(null);
  
  useEffect(()=>{
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Get user's NGOs
      api.get('/ngos/my-ngos')
        .then(r => setMyNgos(r.data))
        .catch(() => setMyNgos([]));
    }
    
    api.get('/ngos').then(r=>setNgos(r.data)).catch(()=>setNgos([]));
  },[]);
  
  return (
    <div>
      <div className="card">
        <h2>Registered NGOs</h2>
        <p className="text-secondary">Discover NGOs making a difference in various causes and communities.</p>
      </div>
      
      {myNgos.length > 0 && (
        <div className="card mb-4" style={{backgroundColor: '#dbeafe', border: '2px solid #3b82f6'}}>
          <h3 className="text-lg font-semibold mb-2">My NGOs</h3>
          <p className="text-sm text-secondary mb-3">Manage your NGOs and add campaigns</p>
          <div className="space-y-2">
            {myNgos.map(n => (
              <div key={n.id} className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{n.name}</h4>
                    {n.domain && <span className="text-xs text-secondary">{n.domain}</span>}
                  </div>
                  <Link to={`/ngos/${n.id}`} className="btn btn-primary text-sm">
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {ngos.map(n=>(
        <div key={n.id} className="card">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold">{n.name}</h3>
            <Link to={'/ngos/'+n.id} className="btn btn-primary">View Details</Link>
          </div>
          
          {n.description && (
            <p className="text-secondary mb-3">{n.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            {n.domain && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                {n.domain}
              </span>
            )}
            {n.location && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                📍 {n.location}
              </span>
            )}
          </div>
          
          {n.objectives && (
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-1">Objectives:</h4>
              <p className="text-sm text-secondary">{n.objectives}</p>
            </div>
          )}
          
          {n.goals && (
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-1">Goals:</h4>
              <p className="text-sm text-secondary">{n.goals}</p>
            </div>
          )}
          
          {n.contact && (
            <div className="text-sm text-muted">
              <strong>Contact:</strong> {n.contact}
            </div>
          )}
        </div>
      ))}
      
      {ngos.length === 0 && (
        <div className="card text-center">
          <p className="text-secondary">No NGOs registered yet. Be the first to register your organization!</p>
        </div>
      )}
    </div>
  );
}
