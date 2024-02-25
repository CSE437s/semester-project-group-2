import { auth, db } from "../firebase";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, arrayUnion, query, where, getDocs, getDoc} from 'firebase/firestore'; // Importing doc function
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from "./LogoutButton";
import NewRoom from "./NewRoom";

const Dashboard = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [className, setClassName] = useState('');
    const [classDescription, setClassDescription] = useState('');
    const [classCode, setClassCode] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [joinClassCode, setJoinClassCode] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [userClasses, setUserClasses] = useState([]);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setInstructorId(auth.currentUser.uid);
                    setUserEmail(auth.currentUser.email);
                    setUserRole(userData.role);
                    setUserStatus(userData.status);

                    // Fetch user's classes...
                    const instructorClassesQuery = query(collection(db, 'classes'), where("instructor", "==", auth.currentUser.uid));
                    const instructorClassesSnap = await getDocs(instructorClassesQuery);
                    const instructorClasses = instructorClassesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const studentClassesQuery = query(collection(db, 'classes'), where("students", "array-contains", auth.currentUser.uid));
                    const studentClassesSnap = await getDocs(studentClassesQuery);
                    const studentClasses = studentClassesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const taClassesQuery = query(collection(db, 'classes'), where("TAs", "array-contains", auth.currentUser.uid));
                    const taClassesSnap = await getDocs(taClassesQuery);
                    const taClasses = taClassesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // Combine all classes...
                    const classes = [...instructorClasses, ...studentClasses, ...taClasses];
                    setUserClasses(classes);
                } else {
                    console.log("No such document in Firestore!");
                }
                setIsLoading(false); // Auth check completed
            } else {
                // No user is signed in.
                navigate('/login');
            }
        });

        return () => unsubscribe(); // Clean up the subscription
    }, [navigate]);


    const handleCreateClassSubmit = async (e) => {
        e.preventDefault();

        // Check if the user has the 'instructor' role before proceeding
        if (userRole !== 'instructor') {
            alert('Only instructors can create classes.');
            return;
        }

        try {
            const classesCollection = collection(db, 'classes');
            await addDoc(classesCollection, {
                className: className,
                classDescription: classDescription,
                createdBy: userEmail,
                classCode: classCode,
                instructor: instructorId,
                students: [],
                TAs: []
            });

            // Reset input fields after successful submission
            setClassName('');
            setClassDescription('');
            setClassCode('');
            alert('Class created successfully!');
        } catch (error) {
            console.error('Error creating class:', error);
            alert('Failed to create class. Please try again.');
        }
    };

    const handleJoinClassSubmit = async (e) => {
        e.preventDefault();

        try {
            // Query the classes collection to find the document with the matching class code
            const q = query(collection(db, 'classes'), where("classCode", "==", joinClassCode));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach(async (classDoc) => {
                    const classData = classDoc.data();

                    // Update user document with the class joined
                    const userRef = doc(db, 'users', auth.currentUser.uid);
                    await updateDoc(userRef, {
                        classes: arrayUnion(classDoc.id)
                    });

                    // Update class document with the student joined
                    await updateDoc(classDoc.ref, {
                        students: arrayUnion(auth.currentUser.uid)
                    });

                    alert('You have successfully joined the class!');
                });
            } else {
                alert('Class not found. Please check the code and try again.');
            }

            setJoinClassCode('');
        } catch (error) {
            console.error('Error joining class:', error);
            alert('Failed to join class. Please try again.');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div>
  <h1>Welcome to the Dashboard, {userEmail || 'Guest'}!</h1>
  {userRole === 'instructor' && userStatus === 'approved' ? (
    <form onSubmit={handleCreateClassSubmit}>
      <input type="text" placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} />
      <input type="text" placeholder="Class Description" value={classDescription} onChange={(e) => setClassDescription(e.target.value)} />
      <input type="text" placeholder="Class Code" value={classCode} onChange={(e) => setClassCode(e.target.value)} />
      <button type="submit">Create Class</button>
    </form>
  ) : userRole === 'instructor' && userStatus === 'pending' ? (
    <div>
      <p>Your instructor account is currently pending approval. You will be notified once your account has been reviewed.</p>
    </div>
  ) : null}
                <form onSubmit={handleJoinClassSubmit}>
                    <input type="text" placeholder="Enter Class Code to Join" value={joinClassCode} onChange={(e) => setJoinClassCode(e.target.value)} />
                    <button type="submit">Join Class</button>
                </form>
            </div>
            {/* Display user's classes */}
            <div>
                <h2>Your Classes</h2>
                <ul>
                    {userClasses.map((userClass) => (
                        <li key={userClass.id}>
                            <Link to={`/class/${userClass.id}`}>
                                <strong>Class Name:</strong> {userClass.className},
                                <strong>Class Description:</strong> {userClass.classDescription}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={()=>{
                navigate("/me")
            }} > My Profile </button>
            <button onClick={()=> {
                navigate("/my-room")
            }}> Go to classroom </button>
            <LogoutButton />
        </>
    );
};
   
export default Dashboard;