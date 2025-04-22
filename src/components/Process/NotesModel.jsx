import React from 'react'

function NotesModel({closeNotesModal}) {
    return (
        <section className="modal small" tabIndex="-1" role="dialog"
            style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1050,
                overflowY: 'auto',
                padding: '20px',
            }}
        >
            <div className="modal-dialog overflow-auto" role="document" style={{
                width: '100%',
                maxWidth: '650px',
                maxHeight: "500px",
                backgroundColor: '#fff',
                borderRadius: '5px',
                overflow: 'hidden',
                boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
                padding: '0px',
            }}
            >
                <div className="modal-content border-0">
                    <div className="modal-header border-bottom pb-2">
                        <button type="button" className="btn-close small" onClick={closeNotesModal} aria-label="Close"></button>
                    </div>

                    <div className="px-1 pt-3">
                        <div className="px-2 pb-4">
                            <div className="row g-3 mb-3">
                                <div className="col-12">
                                    <label htmlFor="systemid" className="form-label mb-0 fw-semibold">
                                        System id
                                    </label>
                                    <input type="text" id="systemid" className="form-control" disabled />
                                </div>
                                <div className="col-12">
                                    <label htmlFor="notes" className="form-label mb-0 fw-semibold">
                                        Notes
                                    </label>
                                    <input type="text" id="notes" className="form-control" />
                                </div>
                            </div>
                            <button className="btn btn-primary">Submit</button>

                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default NotesModel
