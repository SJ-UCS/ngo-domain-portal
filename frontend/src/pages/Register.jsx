import React, {useState} from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [userType, setUserType] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [area, setArea] = useState('');
  const [profileIcon, setProfileIcon] = useState('👤');
  const [objectives, setObjectives] = useState('');
  const [goals, setGoals] = useState('');
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name,
        email,
        password,
        role: userType
      };

      if (userType === 'user') {
        userData.age = parseInt(age);
        userData.mobile = mobile;
        userData.area = area;
        userData.profile_icon = profileIcon;
      }

      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // If NGO registration, also create NGO profile
      if (userType === 'ngo') {
        try {
          await api.post('/ngos', {
            name,
            domain,
            location,
            contact,
            description,
            objectives,
            goals
          });
        } catch (ngoErr) {
          console.error('NGO creation failed:', ngoErr);
        }
      }
      
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const profileIcons = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️'];

  return (
    <div className="card">
      <h3>Register</h3>
      
      {/* User Type Selection */}
      <div className="mb-4">
        <label className="font-semibold mb-2 block">Register as:</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="userType"
              value="user"
              checked={userType === 'user'}
              onChange={(e) => setUserType(e.target.value)}
              className="mr-2"
            />
            Individual User
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="userType"
              value="ngo"
              checked={userType === 'ngo'}
              onChange={(e) => setUserType(e.target.value)}
              className="mr-2"
            />
            NGO Organization
          </label>
        </div>
      </div>

      <form onSubmit={submit}>
        {/* Basic Information */}
        <div className="mb-4">
          <label className="font-semibold mb-2 block">Name *</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            placeholder="Enter your full name"
          />
        </div>

        <div className="mb-4">
          <label className="font-semibold mb-2 block">Email *</label>
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="Enter your email address"
          />
        </div>

        <div className="mb-4">
          <label className="font-semibold mb-2 block">Password *</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            placeholder="Create a strong password"
            minLength="6"
          />
        </div>

        {/* User-specific fields */}
        {userType === 'user' && (
          <>
            <div className="mb-4">
              <label className="font-semibold mb-2 block">Age *</label>
              <input 
                type="number"
                value={age} 
                onChange={e => setAge(e.target.value)} 
                required 
                placeholder="Enter your age"
                min="13"
                max="120"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Mobile Number *</label>
              <input 
                type="tel"
                value={mobile} 
                onChange={e => setMobile(e.target.value)} 
                required 
                placeholder="Enter your mobile number"
                pattern="[0-9]{10}"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Area/Location *</label>
              <input 
                value={area} 
                onChange={e => setArea(e.target.value)} 
                required 
                placeholder="Enter your area/city"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Profile Icon</label>
              <div className="flex flex-wrap gap-2">
                {profileIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setProfileIcon(icon)}
                    className={`p-2 text-2xl border rounded-lg ${
                      profileIcon === icon ? 'bg-gray-200 border-gray-400' : 'border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* NGO-specific fields */}
        {userType === 'ngo' && (
          <>
            <div className="mb-4">
              <label className="font-semibold mb-2 block">Domain/Focus Area</label>
              <input 
                value={domain} 
                onChange={e => setDomain(e.target.value)} 
                placeholder="e.g., Education, Healthcare, Environment"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Location</label>
              <input 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                placeholder="Enter NGO location"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Contact Information</label>
              <input 
                value={contact} 
                onChange={e => setContact(e.target.value)} 
                placeholder="Phone number or contact details"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Brief description of your NGO"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Objectives</label>
              <textarea 
                value={objectives} 
                onChange={e => setObjectives(e.target.value)} 
                placeholder="What are your main objectives?"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mb-2 block">Goals</label>
              <textarea 
                value={goals} 
                onChange={e => setGoals(e.target.value)} 
                placeholder="What are your short-term and long-term goals?"
                rows="3"
              />
            </div>
          </>
        )}

        <button className="btn btn-primary w-full" type="submit">
          {userType === 'ngo' ? 'Register NGO' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
