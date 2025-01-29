// client/src/Components/UserProfile.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import styles from '../css/UserProfile.module.css'; // Импортируем CSS Module
import CONFIG from "../config"; 

const UserProfile: React.FC = () => {
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

  // הפונקציה לשליפת נתוני המשתמש
  const fetchUserData = useCallback(async () => {
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
  }, [page]);

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
  }, [fetchUserData]);

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
  const handleSavePostChanges = async (postId: string) => {
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

  // טיפול בגלילה לטעינת פוסטים נוספים
  const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // אם הגענו לתחתית הדף ויש פוסטים נוספים להציג
    if (scrollHeight - scrollTop === clientHeight && !loadingMore && hasMorePosts) {
      loadMorePosts(); // קריאה לפונקציה להטעין פוסטים נוספים
    }
  };

  if (loading) {
    return (
      <div className={styles.userProfileContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.userProfileContainer}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.userProfileContainer}>
      {userData ? (
        <div className={styles.userProfileCard} onScroll={handleScroll}>
          {/* פרטי המשתמש */}
          <div className={styles.userInfo}>
            <img
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : localStorage.getItem('profilePicture') ||
                    userData.user.profilePicture ||
                    '/default-profile-picture.png'
              }
              className={styles.profilePicture}
              alt="Profile"
            />
            {editable ? (
              <div className={styles.editForm}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className={styles.inputField}
                />
                {error && <div className={styles.errorMessage}>{error}</div>}
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={styles.inputField}
                />
                <div className={styles.buttonGroup}>
                  <button onClick={handleSaveChanges} className={styles.saveButton}>Save Changes</button>
                  <button onClick={() => setEditable(false)} className={styles.cancelButton}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className={styles.viewDetails}>
                <h1 className={styles.username}>{userData.user.username}</h1>
                <p className={styles.userEmail}>Email: {userData.user.email}</p>
                <button onClick={() => setEditable(true)} className={styles.editButton}>Edit</button>
              </div>
            )}
          </div>

          {/* פוסטים של המשתמש */}
          <div className={styles.userPosts}>
            <h2 className={styles.postsHeader}>My Posts</h2>
            {posts && posts.length > 0 ? (
              <ul className={styles.postsList}>
                {posts.map((post) => (
                  <li key={post._id} className={styles.postItem}>
                    {postEditMode === post._id ? (
                      <div>
                        <div className={styles.postEditField}>
                          <label>Post Title:</label>
                          <input
                            type="text"
                            value={currentPostTitle}
                            onChange={(e) => setCurrentPostTitle(e.target.value)}
                            className={styles.postInput}
                          />
                        </div>
                        <div className={styles.postEditField}>
                          <label>Post Content:</label>
                          <input
                            type="text"
                            value={currentPostContent}
                            onChange={(e) => setCurrentPostContent(e.target.value)}
                            className={styles.postInput}
                          />
                        </div>
                        <div className={styles.buttonGroup}>
                          <button onClick={() => handleSavePostChanges(post._id)} className={styles.saveButton}>Save</button>
                          <button onClick={() => setPostEditMode(null)} className={styles.cancelButton}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className={styles.postTitle}>{post.title}</h3>
                        <p className={styles.postContent}>{post.content}</p>
                        {post.image && (
                          <img
                            src={`${CONFIG.SERVER_URL}${post.image}`}
                            alt="Post"
                            className={styles.postImage}
                            loading="lazy"
                          />
                        )}
                        <div className={styles.postActions}>
                          <button className={styles.editButton} onClick={() => handlePostEdit(post._id, post.title, post.content)}>Edit</button>
                          <button className={styles.deleteButton} onClick={() => setShowDeleteConfirmation(post._id)}>Delete</button>
                        </div>
                      </div>
                    )}

                    {/* וופפוי אישור מחיקה */}
                    {showDeleteConfirmation === post._id && (
                      <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                          <p>Are you sure you want to delete this post?</p>
                          <div className={styles.modalButtons}>
                            <button onClick={() => handleDeletePost(post._id)} className={styles.confirmDeleteButton}>Delete</button>
                            <button onClick={() => setShowDeleteConfirmation(null)} className={styles.cancelDeleteButton}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noPosts}>You haven't uploaded any posts yet.</p>
            )}
            {loadingMore && (
              <div className={styles.loadingMore}>
                <div className={styles.spinner}></div>
                <p>Loading more posts...</p>
              </div>
            )}
            {!hasMorePosts && (
              <p className={styles.noMorePosts}>No more posts available.</p>
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
