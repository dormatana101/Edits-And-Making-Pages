import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState<any>(null); // הנתונים של המשתמש
  const [error, setError] = useState<string | null>(null); // שגיאות
  const [loading, setLoading] = useState(true); // מצב טעינה
  const [editable, setEditable] = useState(false); // מצב עריכה
  const [formData, setFormData] = useState<any>({}); // הנתונים לעריכה
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // קובץ התמונה שנבחר

  // שליפת פרטי המשתמש
  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: localStorage.getItem('userId') },
      });
      setUserData(response.data);
      setFormData({
        username: response.data.user.username,
        profilePicture: response.data.user.profilePicture,
      });
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false); // סיום מצב הטעינה
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // טיפול בשינוי שדות הטופס
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // טיפול בהעלאת קובץ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // שמירת השינויים
  const handleSaveChanges = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      return;
    }

    // יצירת FormData לשליחה עם הקובץ
    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    if (selectedFile) {
      formDataToSend.append('profilePicture', selectedFile);
    }

    try {
      await axios.put(
        'http://localhost:3000/api/users/profile',
        formDataToSend, // שליחה עם FormData
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // חשוב להוסיף את ה־header הזה
          },
          params: { userId: localStorage.getItem('userId') },
        }
      );

      await fetchUserData();
      setEditable(false); // סיום עריכה
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
            src={selectedFile ? URL.createObjectURL(selectedFile) : userData.user.profilePicture || '/default-profile-picture.png'}
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
