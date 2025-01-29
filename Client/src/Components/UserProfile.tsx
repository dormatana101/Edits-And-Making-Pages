import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/UserProfile.css';
import SERVER_URL from "../config"; 


const UserProfile = () => {
  const [userData, setUserData] = useState<any>(null); 
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [editable, setEditable] = useState(false); 
  const [formData, setFormData] = useState<any>({}); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${SERVER_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: localStorage.getItem('userId') },
      });
      setUserData(response.data);
      setFormData({
        username: response.data.user.username,
        profilePicture: response.data.user.profilePicture,
      });

      if (response.data.user.profilePicture) {
        localStorage.setItem('profilePicture', response.data.user.profilePicture);
      }
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveChanges = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    if (selectedFile) {
      formDataToSend.append('profilePicture', selectedFile);
    }

    try {
      const response = await axios.put(
        `${SERVER_URL}/api/users/profile`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          params: { userId: localStorage.getItem('userId') },
        }
      );

      if (response.data && response.data.user.profilePicture) {
        localStorage.setItem('profilePicture', response.data.user.profilePicture);
      }

      await fetchUserData();
      setEditable(false); 
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setError('Username is already taken.');
      } else {
        setError('Error updating user data');
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="user-profile-container">
      {userData ? (
        <div className="user-profile-card">
          <div className="user-info">
            <img
              src={selectedFile ? URL.createObjectURL(selectedFile) : localStorage.getItem('profilePicture') || userData.user.profilePicture || '/default-profile-picture.png'}
              className="profile-picture"
            />
            <div className="user-details">
              {editable ? (
                <div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <button onClick={handleSaveChanges}>Save Changes</button>
                  <button onClick={() => setEditable(false)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h1 className="username">{userData.user.username}</h1>
                  <p className="user-email">Email: {userData.user.email}</p>
                  <button onClick={() => setEditable(true)}>Edit</button>
                </div>
              )}
            </div>
          </div>
          <div className="user-posts">
            <h2>My Posts</h2>
            {userData.posts && userData.posts.length > 0 ? (
              <ul className="posts-list">
                {userData.posts.map((post: any) => (
                  <li key={post._id} className="post-item">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content">{post.content}</p>
                    {post.image && (<img src={`${SERVER_URL}${post.image}`} alt="Post image" className="post-image" />)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Haven't uploaded any posts yet.</p>
            )}
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default UserProfile;
