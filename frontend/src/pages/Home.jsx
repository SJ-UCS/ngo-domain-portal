import React from 'react';
export default function Home(){
  return (
    <div>
      <div className="card">
        <h1>Welcome to NGO Domain Portal</h1>
        <p>Discover NGOs, donate to campaigns, and volunteer for causes that matter.</p>
      </div>
      <div className="card">
        <h3>How it works</h3>
        <ol>
          <li>NGOs register and post campaigns.</li>
          <li>Users register, donate or volunteer.</li>
          <li>Admin monitors activities and maintains integrity.</li>
        </ol>
      </div>
    </div>
  );
}
