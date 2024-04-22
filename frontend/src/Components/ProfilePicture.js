import { useEffect, useState, useRef } from 'react';
import { findUser, sendNewPicture } from "../UserUtils";
import "../form.css"

const ProfilePicture = (props) => {
  const [photoURL, setPhotoURL] = useState('');
  const form = useRef()
  useEffect(() => {
    console.log(props.userId)
    findUser(props.userId).then(user => {
      if(photoURL !== user.profilePicture) {
        setPhotoURL(user.profilePicture)
      }
      
    }).catch(e => console.log(e))
    // eslint-disable-next-line
  }, [photoURL]);
 
  const replacePhoto = (e) => {
    // if(e.target.files[0].t)
    if(!e.target.files[0]) { // user exited before selecting a file
      return; 
    }
    const acceptableTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if(acceptableTypes.includes(e.target.files[0].type)) {
      sendNewPicture(e.target.files[0]).then(result => {
        if(result === true) {
          setPhotoURL("")
        }
      })
    }
    else {
      alert("Please upload a JPG, PNG, or GIF file!")
    }
  }

  return (
    <>
      {props.isOwner === true && <div id="container" onClick={() => {
            if(form.current) {
              form.current.click()
          }
        }}
        className={`${props.isOwner === true ? "hover:cursor-pointer" : ""} z-10  w-20 h-20 absolute`}>
      </div>
      }
          <img alt="profile icon" onClick={() => {
            if(props.isOwner === true && form.current) {
              form.current.click()
          }
        }
      } id="image" className={`${props.isOwner === true ? "hover:cursor-pointer" : ""} rounded-full w-20 h-20`} src={photoURL === "" ? "../../public/default-profile.svg" : photoURL} />
      
      <div id="file-upload" className='z-1'>
        <input ref={form}  id="file" type="file" onChange={replacePhoto} />
      </div>
    </>
  );
};

export default ProfilePicture;
