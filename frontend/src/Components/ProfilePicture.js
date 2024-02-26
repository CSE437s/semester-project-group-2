// ProfilePicture.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';


const ProfilePicture = () => {
  const [photoURL, setPhotoURL] = useState('');
 
  console.log("HI");
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then((doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setPhotoURL(userData.photoURL);
          console.log(photoURL);
        }
      }).catch((error) => {
        console.error("Error fetching user data:", error);
      });
    }
  }, []);

  return (
    <div>
      {photoURL ? <img src={photoURL} alt="Profile" className="rounded-full h-10 w-10 h-30 w-auto bg-red-600" /> : null}
    </div>
  );
};

export default ProfilePicture;
