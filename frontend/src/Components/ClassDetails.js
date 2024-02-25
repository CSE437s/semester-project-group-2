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
    const [instructor, setInstructor] = useState(null);

    useEffect(() => {
        const fetchClassDetailsAndStudents = async () => {
            const classRef = doc(db, 'classes', classId);
            const classSnapshot = await getDoc(classRef);

            if (classSnapshot.exists()) {
                const classData = classSnapshot.data();
                setClassDetails(classData);
                setStudents(classData.students);
                setTeachingAssistants(classData.TAs || []);

                setInstructorId(classData.instructor);

                const instructorRef = doc(db, 'users', classData.instructor);
                const instructorSnapshot = await getDoc(instructorRef);

                if (instructorSnapshot.exists()) {
                    setInstructor(instructorSnapshot.data());
                }
            }
        };

        fetchClassDetailsAndStudents();
    }, [classId]);

    const promoteToTA = async (studentId) => {
        if (instructorId && auth.currentUser.uid !== instructorId) {
            alert('Only instructors can promote students to TAs.');
            return;
        }

        const classRef = doc(db, 'classes', classId);
        const classSnapshot = await getDoc(classRef);

        if (classSnapshot.exists()) {
            const studentList = classSnapshot.data().students;
            const taList = classSnapshot.data().TAs;

            if (studentList.includes(studentId) && !taList.includes(studentId)) {
                await updateDoc(classRef, {
                    students: arrayRemove(studentId),
                    TAs: arrayUnion(studentId)
                });

                setStudents(studentList.filter(id => id !== studentId));
                setClassDetails({ ...classDetails, TAs: [...taList, studentId] });
                window.location.reload();
            }
        }
    };

    const rerouteToClassroom = (e) => {
        const TAid = e.target.value;
        navigate("/classrooms/" + TAid);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {classDetails && (
                <>
                    <h1 className="text-3xl font-bold mb-4">{classDetails.className}</h1>
                    <p className="mb-4">{classDetails.classDescription}</p>
                    <h3 className="text-xl font-bold">Professor</h3>
                    {instructor && <p>{instructor.email}</p>}

                    <h2 className="text-xl font-bold mt-8">Students</h2>
                    <ul>
                        {students.map(studentId => (
                            <li key={studentId} className="mb-2 flex items-center justify-between">
                                <span>Student ID: {studentId}</span>
                                {auth.currentUser && instructor && auth.currentUser.uid === instructor.id && (
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => promoteToTA(studentId)}>Promote to TA</button>
                                )}
                            </li>
                        ))}
                    </ul>
                    <h2 className="text-xl font-bold mt-8">Teaching Assistants</h2>
                    <ul>
                        {teachingAssistants.map(taId => (
                            <li key={taId} className="mb-2 flex items-center justify-between">
                                <span>TA ID: {taId}</span>
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" value={taId} onClick={rerouteToClassroom}>View Classroom</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default ClassDetails;
