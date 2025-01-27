
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('לא נמצאו טוקנים');
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (error) {
        setError('שגיאה בהבאת פרטי המשתמש');
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {userData ? (
        <div>
          <h1>פרטי המשתמש</h1>
          <div>
            <img 
              src={userData.user.profilePicture || 'default-profile-picture.png'} 
              alt="Profile" 
              style={{ width: 100, height: 100, borderRadius: '50%' }} 
            />
            <p>שם: {userData.user.username}</p>
            <p>אימייל: {userData.user.email}</p>
            <p>סיסמה: *****</p> {/* כאן תוכל להציג טקסט "*****" במקום הסיסמה */}
            <div>
              <h2>הפוסטים שלי</h2>
              {userData.posts.length > 0 ? (
                <ul>
                  {userData.posts.map((post: any) => (
                    <li key={post._id}>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>לא העלת פוסטים עדיין</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>נטען...</p>
      )}
    </div>
  );
};

export default UserProfile;
