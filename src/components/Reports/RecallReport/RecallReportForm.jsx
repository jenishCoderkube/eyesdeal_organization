import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { reportService } from "../../../services/reportService";
import { recallService } from "../../../services/recallService";
import { useFormik } from "formik";
import { toast } from 'react-toastify';

const RecallReportForm = () => {
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState(''); // New state for selected record's notes

  // Static data for folders
  const folders = [
    'Demo Pictures',
    'Demo%20Pictures',
    'Sale',
    'Testing',
    'glasses',
    'invoice',
    'photos',
    'store'
  ];

  // Formik setup
  const formik = useFormik({
    initialValues: {
      store: [],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      fetchReportData(values);
    },
  });

  // Options for Select Store
  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  // Options for Select Status
  const statusOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await reportService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (formValues) => {
    setLoading(true);
    try {
      const body = {
        stores: formValues.store.map(store => store.value) || ["638b1a079f67a63ea1e1ba01"],
        status: selectedStatus.length > 0 ? selectedStatus[0].value === 'yes' : true,
        startDate: formValues.from.toLocaleDateString('en-GB').replace(/\//g, '-'),
        endDate: formValues.to.toLocaleDateString('en-GB').replace(/\//g, '-'),
      };
  
      const result = await recallService.getRecallReport(body);
      if (result.success) {
        const mappedData = result.data.data.map((item, index) => ({
          id: index + 1,
          lastInvoiceDate: new Date(item.createdAt).toISOString().split('T')[0],
          customerName: item.salesId.customerName,
          customerNumber: item.salesId.customerPhone,
          totalInvoiceValue: `$${item.salesId.netAmount.toFixed(2)}`,
          recallDate: new Date(item.recallDate).toISOString().split('T')[0],
          previousNotes: item.updateNotes || 'No notes',
        }));
        setReportData(mappedData);
      } else {
        toast.error(result.message);
        setReportData([]);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to fetch report data");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* Asset Selection Modal */}
      <div 
        className={`modal fade ${showAssetModal ? 'show d-block' : ''}`} 
        tabIndex="-1" 
        role="dialog" 
        aria-hidden={!showAssetModal}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Select Assets</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowAssetModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row mb-4">
                  <div className="col">
                    <h6>Folders</h6>
                    <div className="row mt-3">
                      <div className="col-auto">
                        <button className="btn btn-primary">Back</button>
                      </div>
                      {folders.map((folder, index) => (
                        <div key={index} className="col-3 text-center mb-3">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="70" 
                            height="70" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="cursor-pointer"
                          >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <p className="truncate">{folder}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <h6>Assets</h6>
                    <div className="row">
                      {/* Empty grid for assets */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowAssetModal(false)}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
      {showAssetModal && <div className="modal-backdrop fade show"></div>}

      {/* Main Content */}
      <div className="container-fluid py-4 px-5">
        <h1 className="mb-4">Recall Report</h1>
        <div className="card">
          <div className="card-body">
            <form className="mb-4" onSubmit={formik.handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label htmlFor="store" className="form-label">Select Store</label>
                  <Select
                    isMulti
                    isLoading={loading}
                    options={storeOptions}
                    value={formik.values.store}
                    onChange={(option) => formik.setFieldValue("store", option)}
                    onBlur={() => formik.setFieldTouched("store", true)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    id="store"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="isRecall" className="form-label">Select Status</label>
                  <Select
                    id="isRecall"
                    isMulti
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="from" className="form-label">Date From</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="from" 
                    value={formik.values.from.toISOString().split('T')[0]}
                    onChange={(e) => formik.setFieldValue('from', new Date(e.target.value))}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="to" className="form-label">Date To</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="to" 
                    value={formik.values.to.toISOString().split('T')[0]}
                    onChange={(e) => formik.setFieldValue('to', new Date(e.target.value))}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Loading...' : 'Submit'}
              </button>
            </form>

            {/* Table */}
            <div className="table-responsive">
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th>Last Invoice Date</th>
                    <th>Customer Name</th>
                    <th>Customer Number</th>
                    <th>Total Invoice Value</th>
                    <th>Recall Date</th>
                    <th>Previous Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.lastInvoiceDate}</td>
                      <td>{item.customerName}</td>
                      <td>{item.customerNumber}</td>
                      <td>{item.totalInvoiceValue}</td>
                      <td>{item.recallDate}</td>
                      <td>{item.previousNotes}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedNotes(item.previousNotes);
                            setShowNotesModal(true);
                          }}
                        >
                          View Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <div 
        className={`modal fade ${showNotesModal ? 'show d-block' : ''}`} 
        tabIndex="-1" 
        role="dialog" 
        aria-hidden={!showNotesModal}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Notes</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowNotesModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <h6 className="fw-bold">Recall Update Notes</h6>
              <p>{selectedNotes || 'No notes available'}</p>
              <h6 className="fw-bold mt-3">Reschedule Notes</h6>
              <p>No notes available</p>
            </div>
          </div>
        </div>
      </div>
      {showNotesModal && <div className="modal-backdrop fade show"></div>}
    </main>
  );
};

export default RecallReportForm;