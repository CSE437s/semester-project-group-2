import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore"; // Importing doc function
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState(null);
  // eslint-disable-next-line
  const [userName, setUserName] = useState("");
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [classCode, setClassCode] = useState("");
  const [joinClassCode, setJoinClassCode] = useState("");
  // eslint-disable-next-line
  const [instructorId, setInstructorId] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userClasses, setUserClasses] = useState([]);
  const [userRoleInClasses, setUserRoleInClasses] = useState({});
  
  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserEmail(auth.currentUser.email);
          setUserName(`${userData.firstName} ${userData.lastName}`);
          setUserRole(userData.role);
          setUserStatus(userData.status);

          // Fetch user's classes...
          const instructorClassesQuery = query(
            collection(db, "classes"),
            where("instructor", "==", auth.currentUser.uid)
          );
          const instructorClassesSnap = await getDocs(instructorClassesQuery);
          const instructorClasses = instructorClassesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const studentClassesQuery = query(
            collection(db, "classes"),
            where("students", "array-contains", auth.currentUser.uid)
          );
          const studentClassesSnap = await getDocs(studentClassesQuery);
          const studentClasses = studentClassesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const taClassesQuery = query(
            collection(db, "classes"),
            where("TAs", "array-contains", auth.currentUser.uid)
          );
          const taClassesSnap = await getDocs(taClassesQuery);
          const taClasses = taClassesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const rolesInClasses = {};
      for (const userClass of instructorClasses) {
        rolesInClasses[userClass.id] = 'Instructor';
      }
      for (const userClass of taClasses) {
        rolesInClasses[userClass.id] = 'TA';
      }
      for (const userClass of studentClasses) {
        if (!rolesInClasses[userClass.id]) { // Avoid overwriting if already set as 'Instructor' or 'TA'
          rolesInClasses[userClass.id] = 'Student';
        }
      }
      setUserRoleInClasses(rolesInClasses);
          // Combine all classes...
          const classes = [
            ...instructorClasses,
            ...studentClasses,
            ...taClasses,
          ];
          setUserClasses(classes);
        } else {
          console.log("No such document in Firestore!");
        }
        setIsLoading(false); // Auth check completed
      } else {
        // No user is signed in.
        navigate("/login");
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, [navigate]);

  const handleCreateClassSubmit = async (e) => {
    e.preventDefault();

    // Check if the user has the 'instructor' role before proceeding
    if (userRole !== "instructor") {
      alert("Only instructors can create classes.");
      return;
    }

    try {
      const classesCollection = collection(db, "classes");
      await addDoc(classesCollection, {
        className: className,
        classDescription: classDescription,
        createdBy: userEmail,
        classCode: classCode,
        instructor: instructorId,
        students: [],
        TAs: [],
      });

      // Reset input fields after successful submission
      setClassName("");
      setClassDescription("");
      setClassCode("");
      alert("Class created successfully! Refreshing...");
      window.location.reload(); // force automatic reload
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class. Please try again.");
    }
  };

  const handleJoinClassSubmit = async (e) => {
    e.preventDefault();

    try {
      // Query the classes collection to find the document with the matching class code
      const q = query(
        collection(db, "classes"),
        where("classCode", "==", joinClassCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (classDoc) => {
          // const classData = classDoc.data();

          // Update user document with the class joined
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            classes: arrayUnion(classDoc.id),
          });

          // Update class document with the student joined
          await updateDoc(classDoc.ref, {
            students: arrayUnion(auth.currentUser.uid),
          });

          alert("You have successfully joined the class! Refreshing...");
          window.location.reload();// force automatic reload to see the joined class
        });
      } else {
        alert("Class not found. Please check the code and try again.");
      }

      setJoinClassCode("");
    } catch (error) {
      console.error("Error joining class:", error);
      alert("Failed to join class. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="font-mono">
      <header className="bg-indigo-300 p-0 py-5">
        <div className="container flex justify-between items-center max-w-full">

          <Link to="/home"><div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
          </div></Link>

          <div>
          <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
              onClick={() => navigate("/me")}
            >
              My Profile
            </button>
            <LogoutButton />
            
          </div>
        </div>
      </header>
      <div className="p-6 bg-gray-100">

        {userRole === "instructor" && userStatus === "approved" ? (
          <form onSubmit={handleCreateClassSubmit} className="mb-6">
            <input
              className="border border-gray-300 p-2 rounded mb-2 block"
              type="text"
              placeholder="Class Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded mb-2 block"
              type="text"
              placeholder="Class Description"
              value={classDescription}
              onChange={(e) => setClassDescription(e.target.value)}
            />
          
            <input
              className="border border-gray-300 p-2 rounded mb-2 block"
              type="text"
              placeholder="Class Code"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Create Class
            </button>
          </form>
        ) : userRole === "instructor" && userStatus === "pending" ? (
          <div className="mb-6">
            <p>
              Your instructor account is currently pending approval. You will be
              notified once your account has been reviewed.
            </p>
          </div>
        ) : null}
       
        {/* Display user's classes */}
        <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Classes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userClasses.map((userClass) => (
            <div key={userClass.id} className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between h-48">
              <Link to={`/class/${userClass.id}`} className="hover:underline">
                <h3 className="font-bold text-lg mb-2">{userClass.className}</h3>
                <p className="text-gray-700 flex-grow">{userClass.classDescription}</p>
              </Link>
              <span className="inline-block bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-semibold mt-4 self-start">
                {userRoleInClasses[userClass.id]}
              </span>
            </div>
          ))}
        </div>
      </div>
        <form onSubmit={handleJoinClassSubmit} className="mb-6 flex items-center">
  <label htmlFor="joinClassCode" className="mr-2">
    Join a Class:
  </label>
  <input
    id="joinClassCode"
    className="border border-gray-300 p-2 rounded mb-2 block mr-2"
    type="text"
    placeholder="Enter Class Code to Join"
    value={joinClassCode}
    onChange={(e) => setJoinClassCode(e.target.value)}
  />
  <button
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    type="submit"
  >
    Join Class
  </button>
</form>
        {/* <div className="flex justify-between items-center mb-6">

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate("/my-room")}
          >
            Go to Classroom
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
