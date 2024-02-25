import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';

const ClassDetails = ({ instructorId }) => {
    const { classId } = useParams();
    const [classDetails, setClassDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachingAssistants, setTeachingAssistants] = useState([]);
    const [instructor, setInstructor] = useState(null);

    useEffect(() => {
        const fetchClassDetailsAndStudents = async () => {
            const classRef = doc(db, 'classes', classId);
            const classSnapshot = await getDoc(classRef);

            if (classSnapshot.exists()) {
                setClassDetails(classSnapshot.data());
                setStudents(classSnapshot.data().students);
                setTeachingAssistants(classSnapshot.data().TAs || []); // Initialize TAs with existing data or empty array
            
                // Fetch instructor details
                const instructorRef = doc(db, 'users', classSnapshot.data().instructor);
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
        if (auth.currentUser.uid !== instructorId) {
            alert('Only instructors can promote students to TAs.');
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
            }
        }
    };

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
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default ClassDetails;
