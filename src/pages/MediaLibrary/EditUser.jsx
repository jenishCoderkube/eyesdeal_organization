import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import './AddAssetPopup.css'; // Add CSS for animation

const EditUser = ({ onClose }) => {
    const [activeContent, setActiveContent] = useState("");




    return (
        <div className="custom-modal-overlay">
            <div className="custom-modal-content animate-modal">
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose}></button>

                <h4 className="text-left">Edit User</h4>
                <div className='p-2 '>
                    <div className='border-b border-slate-200 gap-4 mb-2'></div>

                    <div className='flex gap-4 mb-2'>
                        <span
                            className='text-left cursor-pointer text-blue-600'
                            onClick={() => setActiveContent('image')}
                        >
                            Add Image
                        </span>
                        <span
                            className='text-left cursor-pointer text-blue-600'
                            onClick={() => setActiveContent('text')}
                        >
                            Add File
                        </span>
                    </div>

                    {/* Display content based on selected option */}

                </div>
                <div className='border-b border-slate-200 gap-4 mb-2'>
                    <h6 className="text-left">Location</h6>
                    <input
                        type="text"
                        className='search-input1 w-100 bg-gray-200 p-2 rounded'
                        placeholder='/'
                    />
                </div>

                <h6 className="text-left">File Name</h6>
                <input type="text" className='search-input w-100' placeholder='' />

                <div className='mb-1 flex gap-4'>
                    <div className='mt-4'>
                        {activeContent === 'image' && <p>Photos(max 15 at a time)</p>}
                        {activeContent === 'text' && <p>files(max 5 at a time)</p>}
                        <button className='btn btn-primary btn bg-indigo-500 hover:bg-indigo-600 text-white undefined'>Add</button>
                    </div>

                </div>
                <button className='btn btn-primary btn bg-indigo-500 hover:bg-indigo-600 text-white undefined'>Submit</button>
            </div>

        </div>
    );
};

export default EditUser;
