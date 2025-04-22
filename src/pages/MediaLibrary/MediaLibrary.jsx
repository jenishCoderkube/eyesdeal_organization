import React, { useState } from 'react'
import EditUser from './EditUser';

function MediaLibrary() {
    const [showPopup, setShowPopup] = useState("");


    const Addasset = () => {
        console.log("Add asset clicked");

        setShowPopup(true);

    }

    return (
        <div className='media_library px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto'>
            <div className='media_library_header sm:flex sm:justify-between sm:items-center mb-8'>
                <div className='header_name mb-4 sm:mb-0'>
                    <h1>Media Library</h1>
                </div>
                <div className='header_area grid grid-flow-col sm:auto-cols-max sm:justify-end gap-2'>
                    <input type="text" className='search-input' />
                    <button type="button" class="btn btn-primary"
                        onClick={() => Addasset()}
                        data-toggle="modal" data-target="#exampleModalCenter">
                        Add Asset
                    </button>

                    <button className='btn'>Add Folder</button>

                </div>


            </div>

            {showPopup && (
                <EditUser onClose={() => setShowPopup(false)} />
            )}
        </div>
    )
}

export default MediaLibrary
