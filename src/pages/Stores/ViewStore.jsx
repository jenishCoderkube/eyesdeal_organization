import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import EditStoreModal from "../../components/Stores/EditStoreModal.jsx";
import DeactivateStoreModal from "../../components/Stores/DeactivateStoreModal.jsx";
import { storeService } from "../../services/storeService.js";
import { toast } from "react-toastify";
import DeleteModal from "../../components/DeleteModal/DeleteModal.jsx";

const ViewStore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const hideDeleteModal = () => {
    setDeleteId(null);
  };

  useEffect(() => {
    if (deleteId) {
      setDeleteModal(true);
    } else {
      setDeleteModal(false);
    }
  }, [deleteId]);

  const fetchStores = async () => {
    try {
      const storeData = await storeService.getStores();
      setStores(storeData);
    } catch (err) {
      console.log("Failed to load stores", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleEdit = (store) => {
    setSelectedStore(store);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await storeService.deleteStore(deleteId);
      if (response?.data?.success) {
        setDeleteId(null);
        setDeleteModal(false);
        toast.success(response?.data?.message);
        fetchStores();
      }
    } catch (error) {
      console.log("Error deleting store:", error);
    }
  };

  const handleDeactivate = (store) => {
    setSelectedStore(store);
    setShowDeactivateModal(true);
  };

  const filteredStores = stores?.filter((store) =>
    store?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="mb-4">
            <h1 className="h2 text-dark fw-bold">View Stores</h1>
          </div>
          <div
            className="card shadow-sm"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Stores</h6>
            <div className="card-body px-0 py-3">
              <div className="mb-4 col-md-5">
                <div className="input-group px-3">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch
                      className="text-muted"
                      style={{ color: "#94a3b8" }}
                    />
                  </span>
                  <input
                    type="search"
                    className="form-control border-start-0"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
                    <tr>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        SRNO
                      </th>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        Active In Website
                      </th>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        System Id
                      </th>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        Store Name
                      </th>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        Billing Sequence
                      </th>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredStores?.map((store, index) => {
                      return (
                        <tr key={store.id}>
                          {/* <td className="p-3">{store?.id}</td> */}
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            {store?.activeInWebsite.toString()}
                          </td>
                          {/* <td className="p-3">{store.systemId}</td> */}
                          <td className="p-3">{store?._id}</td>
                          <td className="p-3">{store?.name}</td>
                          <td className="p-3">{store?.storeNumber}</td>
                          <td className="p-3">
                            <div className="d-flex gap-2 align-items-center">
                              <FiEdit2
                                size={24}
                                className="text-dark cursor-pointer"
                                onClick={() => handleEdit(store)}
                              />
                              <MdDeleteOutline
                                size={24}
                                role="button"
                                className="text-danger cursor-pointer"
                                onClick={() => setDeleteId(store?._id)}
                              />
                              <button
                                className="btn btn-sm p-2"
                                onClick={() => handleDeactivate(store)}
                                style={{
                                  backgroundColor: "#f43f5e",
                                  color: "#fff",
                                }}
                              >
                                Deactivate
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        show={deleteModal}
        onHide={hideDeleteModal}
        onDelete={handleDelete}
        title="Delete Store"
        body="Are you sure you want to delete this record?"
      />

      <EditStoreModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        storeData={selectedStore}
      />
      <DeactivateStoreModal
        show={showDeactivateModal}
        onHide={() => setShowDeactivateModal(false)}
        storeData={selectedStore}
        stores={stores}
      />
    </div>
  );
};

export default ViewStore;
