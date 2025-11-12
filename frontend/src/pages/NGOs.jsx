import React, {useEffect, useState} from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function NGOs(){
  const [ngos,setNgos] = useState([]);
  useEffect(()=>{
    api.get('/ngos').then(r=>setNgos(r.data)).catch(()=>setNgos([]));
  },[]);
  return (
    <div>
      <div className="card">
        <h2>Registered NGOs</h2>
        <p className="text-secondary">Discover NGOs making a difference in various causes and communities.</p>
      </div>
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
