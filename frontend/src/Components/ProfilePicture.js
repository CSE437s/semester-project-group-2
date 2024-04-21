// ProfilePicture.js
import { useEffect, useState } from 'react';
// import { auth, db } from '../firebase';
// import { doc, getDoc } from 'firebase/firestore';

import { getCurrentUser, sendNewPicture } from "../UserUtils";
import "../form.css"

const ProfilePicture = () => {
  const [photoURL, setPhotoURL] = useState('');
  useEffect(() => {
    getCurrentUser().then(user => {
      if(photoURL !== user.data.user.profilePicture) {
        setPhotoURL(user.data.user.profilePicture)
      }
      
    }).catch(e => console.log(e))
  }, [photoURL]);
 
  const replacePhoto = (e) => {
    sendNewPicture(e.target.files[0]).then(result => {
      if(result === true) {
        setPhotoURL("")
      }
    })
  }

  return (
    <>
    <div id="file-upload" >
      <img id="image" className="rounded-full h-10 w-10 h-30 w-auto" src={photoURL === "" ? "../../public/settings.svg" : photoURL} />
      <input id="file" type="file" onChange={replacePhoto} />
    </div>
    </>
  );
};

export default ProfilePicture;
