import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateClassForm = () => {
    const [className, setClassName] = useState("");
    const [classDescription, setClassDescription] = useState("");
    const [classCode, setClassCode] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const classesCollection = collection(db, "classes");
            await addDoc(classesCollection, {
                className,
                classDescription,
                classCode,
                instructor: auth.currentUser.uid,
                students: [],
                TAs: [],
            });
            alert("Class created successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error creating class:", error);
            alert("Failed to create class. Please try again.");
        }
    };

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Create a New Class</h1>
            <form onSubmit={handleSubmit} className="mb-6">
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
        </div>
    );
};

export default CreateClassForm;
