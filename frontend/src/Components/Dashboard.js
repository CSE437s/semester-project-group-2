import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
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

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("");
  const [joinClassCode, setJoinClassCode] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userClasses, setUserClasses] = useState([]);

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

  // const handleCreateClassSubmit = async (e) => {
  //   e.preventDefault();

  //   // Check if the user has the 'instructor' role before proceeding
  //   if (userRole !== "instructor") {
  //     alert("Only instructors can create classes.");
  //     return;
  //   }

  //   try {
  //     const classesCollection = collection(db, "classes");
  //     await addDoc(classesCollection, {
  //       className: className,
  //       classDescription: classDescription,
  //       createdBy: userEmail,
  //       classCode: classCode,
  //       instructor: instructorId,
  //       students: [],
  //       TAs: [],
  //     });

  //     // Reset input fields after successful submission
  //     setClassName("");
  //     setClassDescription("");
  //     setClassCode("");
  //     alert("Class created successfully! Refreshing...");
  //     window.location.reload(); // force automatic reload
  //   } catch (error) {
  //     console.error("Error creating class:", error);
  //     alert("Failed to create class. Please try again.");
  //   }
  // };

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to the Dashboard, {userName || userEmail}</h1>
            <div className="mt-2">
              <button
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => navigate("/me")}
              >
                My Profile
              </button>
              <button
                className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => navigate("/my-room")}
              >
                Go to Classroom
              </button>
            </div>
          </div>
          <div>
          {userRole === "instructor" && userStatus === "approved" && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => navigate("/create-class")}
            >
              Create Class
            </button>
          )}
          {userRole === "instructor" && userStatus === "pending" && (
            <p className="text-red-500 font-bold">Your instructor account is pending approval.</p>
          )}
            <LogoutButton />
          </div>
        </header>

        <div className="mb-6">
          <div className="flex gap-4">
            <input
              className="flex-grow shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              type="text"
              placeholder="Enter Class Code to Join"
              value={joinClassCode}
              onChange={(e) => setJoinClassCode(e.target.value)}
            />
            <button
              className="flex-shrink-0 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700"
              type="submit"
              onClick={handleJoinClassSubmit}
            >
              Join Class
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userClasses.map((userClass) => (
            <div
              key={userClass.id}
              className="bg-white rounded shadow p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/class/${userClass.id}`)}
            >
              <h3 className="font-semibold">{userClass.className}</h3>
              <p>{userClass.classDescription}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
