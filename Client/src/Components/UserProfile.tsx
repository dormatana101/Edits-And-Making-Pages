import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/UserProfile.css';
import CONFIG from "../config"; 


const UserProfile = () => {
  const [userData, setUserData] = useState<any>(null); // נתוני המשתמש
  const [error, setError] = useState<string | null>(null); // הודעות שגיאה
  const [loading, setLoading] = useState(true); // מצב טעינה
  const [editable, setEditable] = useState(false); // מצב עריכה לפרופיל
  const [editableUsername, setEditableUsername] = useState(false); // מצב עריכה לשם משתמש
  const [postEditMode, setPostEditMode] = useState<string | null>(null); // מצב עריכה לפוסט
  const [formData, setFormData] = useState<any>({}); // נתוני טופס לפרופיל
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // קובץ שנבחר להעלאה
  const [currentPostTitle, setCurrentPostTitle] = useState<string>(''); // כותרת פוסט לעריכה
  const [currentPostContent, setCurrentPostContent] = useState<string>(''); // תוכן פוסט לעריכה
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null); // ID הפוסט שמיועד למחיקה
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<any[]>([]); // שמירת הפוסטים המוצגים
  const [loadingMore, setLoadingMore] = useState(false); // מניעת טעינה כפולה
  const [hasMorePosts, setHasMorePosts] = useState(true); // אם יש עוד פוסטים לטעינה

  // פונקציה לשליפת נתוני המשתמש
  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    try {
        // שליפת נתוני המשתמש
        const response = await axios.get(`${CONFIG.SERVER_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId: localStorage.getItem('userId'), page, limit: 5 },
        });
    
        // עדכון נתוני המשתמש
        setUserData(response.data);
        setFormData({
          username: response.data.user.username,
          profilePicture: response.data.user.profilePicture,
        });
    
        // שמירת תמונת פרופיל בלוקאלסטורג'
        if (response.data.user.profilePicture) {
          localStorage.setItem('profilePicture', response.data.user.profilePicture);
        }
    
        // עדכון הפוסטים
        setPosts((prevPosts) => {
            const newPosts = response.data.posts.filter(
              (post: any) => !prevPosts.some((p: any) => p._id === post._id) // מסנן פוסטים שכבר קיימים
            );
            return [...prevPosts, ...newPosts]; // מוסיף את הפוסטים החדשים לפוסטים הקיימים
          });
    
        // בדיקת אם יש עוד פוסטים להציג
        setHasMorePosts(response.data.hasMorePosts);
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    // פונקציה לטעינת פוסטים נוספים בעת גלילה
    const loadMorePosts = async () => {
      if (loadingMore || !hasMorePosts) return; // אם כבר טוענים או שאין עוד פוסטים, אל תבצע את הפעולה
    
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1); // הגדלת הדף
    
      try {
        // טוען את הפוסטים בדף הבא
        await fetchUserData();
      } catch (error) {
        setError('Error fetching more posts');
      } finally {
        setLoadingMore(false);
      }
    };
    
    useEffect(() => {
      fetchUserData();
    }, [page]);

  // טיפול בשינוי ערכים בטופס עריכה
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // טיפול בבחירת קובץ להעלאה
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  

  // שמירת שינויים בפרופיל
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
        `${CONFIG.SERVER_URL}/api/users/profile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

  // עריכת פוסט
  const handlePostEdit = (postId: string, currentTitle: string, currentContent: string) => {
    setPostEditMode(postId);
    setCurrentPostTitle(currentTitle);
    setCurrentPostContent(currentContent);
  };

  // שמירת שינויים בפוסט
  const handleSavePostChanges = async (postId: string,) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      await axios.put(
        `${CONFIG.SERVER_URL}/posts/${postId}`,
        { title: currentPostTitle, content: currentPostContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData((prevData: any) => ({
        ...prevData,
        posts: prevData.posts.map((post: any) =>
          post._id === postId ? { ...post, title: currentPostTitle, content: currentPostContent } : post
        ),
      }));
      setPostEditMode(null);
    } catch (error) {
      setError('Error saving post changes');
    }
  };

  // מחיקת פוסט
  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      await axios.delete(`${CONFIG.SERVER_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData((prevData: any) => ({
        ...prevData,
        posts: prevData.posts.filter((post: any) => post._id !== postId),
      }));
      setShowDeleteConfirmation(null);
    } catch (error) {
      setError('Error deleting post');
    }
  };
  const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // אם הגענו לתחתית הדף ויש פוסטים נוספים להציג
    if (scrollHeight - scrollTop === clientHeight && !loadingMore && hasMorePosts) {
      loadMorePosts(); // קריאה לפונקציה להטעין פוסטים נוספים
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
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : localStorage.getItem('profilePicture') ||
                    userData.user.profilePicture ||
                    '/default-profile-picture.png'
              }
              className="profile-picture"
              alt="Profile"
            />
            {editable ? (
              <div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                />
                {error && <div className="error-message">{error}</div>}
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
                <button className="cancel-button" onClick={() => setEditable(false)}>Cancel</button>
              </div>
            ) : (
              <div>
                <h1 className="username">{userData.user.username}</h1>
                <p className="user-email">Email: {userData.user.email}</p>
                <button className="edit-button" onClick={() => setEditable(true)}>Edit</button>
              </div>
            )}
          </div>
          <div className="user-posts"onScroll={handleScroll}>
            <h2>My Posts</h2>
            {userData.posts && userData.posts.length > 0 ? (
              <ul className="posts-list">
                {userData.posts.map((post: any) => (
                  <li key={post._id} className="post-item">
                    {postEditMode === post._id ? (
                      <div>
                        <div className="post-edit-field">
                          <label>Post Title:</label>
                          <input
                            type="text"
                            value={currentPostTitle}
                            onChange={(e) => setCurrentPostTitle(e.target.value)}
                          />
                        </div>
                        <div className="post-edit-field">
                          <label>Post Content:</label>
                          <input
                            type="text"
                            value={currentPostContent}
                            onChange={(e) => setCurrentPostContent(e.target.value)}
                          />
                        </div>
                        <button onClick={() => handleSavePostChanges(post._id)}>Save</button>
                        <button onClick={() => setPostEditMode(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        <button className="edit-button" onClick={() => handlePostEdit(post._id, post.title, post.content)}>Edit</button>
                        <button className="delete-button" onClick={() => setShowDeleteConfirmation(post._id)}>Delete</button>
                      </div>
                    )}
                      {showDeleteConfirmation === post._id && (
                        <div className="delete-confirmation">
                          <p>Are you sure you want to delete this post?</p>
                          <button className="confirm-delete delete-button" onClick={() => handleDeletePost(post._id)}>Delete</button>
                          <button className="cancel-delete cancel-button" onClick={() => setShowDeleteConfirmation(null)}>Cancel</button>
                        </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No posts yet</p>
            )}
          </div>
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
};

export default UserProfile;
