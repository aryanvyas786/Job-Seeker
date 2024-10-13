import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  userType: string;
  agencyId: number | null;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const response = await axios.get('http://localhost:9000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }, // Pass token as Authorization header
        });

      
        
        // Save the token in localStorage (if needed)
        localStorage.setItem('token', token);
        
        // Set the users data
        setUsers(response.data.userList);
        // console.log(response.data.userList)
      } catch (error) {
        setError(  'Error fetching users');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Dashboard</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>First Name</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Last Name</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Email</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Phone</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Gender</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>User Type</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.firstName}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.lastName}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.email}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.phone}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.gender}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{user.userType === '1' ? 'Job Seeker' : 'Agency'}</td>
             
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
