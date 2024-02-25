import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';

const ClassDetails = ({}) => {
    const { classId } = useParams();
    const [classDetails, setClassDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachingAssistants, setTeachingAssistants] = useState([]);
    const navigate = useNavigate();
    const [instructorId, setInstructorId] = useState(null);
  
    useEffect(() => {
        const fetchClassDetailsAndStudents = async () => {
            const classRef = doc(db, 'classes', classId);
            const classSnapshot = await getDoc(classRef);
    
            if (classSnapshot.exists()) {
                const classData = classSnapshot.data(); // Declaring classData here
                setClassDetails(classData);
                setStudents(classData.students);
                setTeachingAssistants(classData.TAs || []);
    
                // Set instructor ID
                setInstructorId(classData.instructor);
    
                // Fetch instructor details if needed
                const instructorRef = doc(db, 'users', classData.instructor);
                const instructorSnapshot = await getDoc(instructorRef);
    
                if (instructorSnapshot.exists()) {
                    setInstructor(instructorSnapshot.data());
                }
            }
        };
    
        fetchClassDetailsAndStudents();
    }, [classId]);

    // Function to promote a student to a TA
    const promoteToTA = async (studentId) => {
        // Check if the current user is the instructor
        if (instructorId && auth.currentUser.uid !== instructorId) {
            alert("instructorId should be " + instructorId);

            alert('Only instructors can promote students to TAs.');
            alert(auth.currentUser.uid);
            return;
        }

        const classRef = doc(db, 'classes', classId);
        const classSnapshot = await getDoc(classRef);

        if (classSnapshot.exists()) {
            const studentList = classSnapshot.data().students;
            const taList = classSnapshot.data().TAs;

            // Check if the student is not already a TA
            if (studentList.includes(studentId) && !taList.includes(studentId)) {
                // Remove the student from the 'students' array and add to 'TAs'
                await updateDoc(classRef, {
                    students: arrayRemove(studentId),
                    TAs: arrayUnion(studentId)
                });

                // Update the local state
                setStudents(studentList.filter(id => id !== studentId));
                setClassDetails({ ...classDetails, TAs: [...taList, studentId] });
                window.location.reload() // force reload to show new TA
            }
        }
    };

    const rerouteToClassroom = (e) => {
        const TAid = e.target.value
        navigate("/classrooms/"+ TAid)
    }

    return (
        <div>
            {classDetails && (
                <>
                    <h1>{classDetails.className}</h1>
                    <p>{classDetails.classDescription}</p>
                    <h3>Professor</h3>
                    {instructor && <p>{instructor.email}</p>}

                    <h2>Students</h2>
                    <ul>
                        {students.map(studentId => (
                            <li key={studentId}>
                                {auth.currentUser && instructor ? 
                                <>Student ID: {studentId}{' '}
                                {/* Button to promote student to TA */}
                                {auth.currentUser.uid === instructor.id ?  <button onClick={() => promoteToTA(studentId)}>Promote to TA</button> : <></>}
                                </>
                                :
                                <></>
                                }
                            </li>
                        ))}
                    </ul>
                    <h2>Teaching Assistants</h2>
                    <ul>
                        {teachingAssistants.map(taId => (
                            <li key={taId}>
                                TA ID: {taId}
                                <button value={taId} onClick={rerouteToClassroom}>View classroom</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default ClassDetails;
