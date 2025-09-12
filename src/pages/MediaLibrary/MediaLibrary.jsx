import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import FolderList from "../../components/MediaLibrary/FolderList";
import FileList from "../../components/MediaLibrary/FileList";
import AddAssetModal from "../../components/MediaLibrary/AddAssetModal";
import AddFolderModal from "../../components/MediaLibrary/AddFolderModal";
import { FolderTreeProvider, useFolderTree } from "./FolderTreeContext";
import { mediaService } from "../../services/mediaService";
import { toast } from "react-toastify";
import Processing from "../../components/Processing/Processing";

const MediaLibrary = () => {
  const navigate = useNavigate();
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolder] = useState([]);

  const { setFolderTree } = useFolderTree();

  const [loading, setLoading] = useState(false);

  const handleFolderClick = (folderName) => {
    console.log("Navigating to folder:", folderName);
    navigate(`/media-library/${folderName}`);
  };

  const handleAddFolder = (newFolder) => {
    console.log("Adding folder at root:", newFolder.name);
    setFolderTree((prevTree) => [
      ...prevTree,
      { name: newFolder.name, subfolders: [], files: [] },
    ]);
  };

  const handleAddFile = (newFile) => {
    console.log("Adding file at root:", newFile.name);
    setFolderTree((prevTree) => {
      const newTree = JSON.parse(JSON.stringify(prevTree));
      if (newTree.length === 0) {
        newTree.push({ name: "default", subfolders: [], files: [newFile] });
      } else {
        newTree[0].files.push(newFile);
      }
      return newTree;
    });
  };
  function extractMediaPath(input) {
    const prefix = "/media-library";

    if (input === prefix) {
      return "/";
    }

    if (input.startsWith(prefix)) {
      let result = input.slice(prefix.length);

      // Remove leading slash if it exists
      if (result.startsWith("/")) {
        result = result.slice(1);
      }

      // Ensure trailing slash
      if (!result.endsWith("/")) {
        result += "/";
      }

      return result;
    }

    return input;
  }

  const path = useLocation();
  let currentFolder = extractMediaPath(path?.pathname);
  useEffect(() => {
    getMedia(currentFolder);
  }, [currentFolder]);

  const getMedia = async (path) => {
    setLoading(true);

    try {
      const response = await mediaService.getMedia(path);
      if (response.success) {
        setFolder(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const btnHide = () => {
    getMedia(currentFolder);
    setShowFolderModal(false);
    setShowAssetModal(false);
  };

  const handleDeleteFile = async (fileName) => {
    // setLoading(true);
    const keys = ["keys[0]"];
    const params = {
      [keys[0]]: fileName,
      currentFolder: currentFolder,
    };

    const queryString = new URLSearchParams(params).toString();
    setLoading(true);

    try {
      const response = await mediaService.deleteAssets(queryString);
      if (response.success) {
        toast.success(response?.data?.message);
        getMedia(currentFolder);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const btnDeleteFolder = async () => {
    const params = {
      keys: currentFolder,
      currentFolder: currentFolder,
    };

    const queryString = new URLSearchParams(params).toString();
    setLoading(true);
    try {
      const response = await mediaService.deleteFolder(queryString);
      if (response.success) {
        toast.success(response?.data?.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      navigate(-1);
      setLoading(false);
    }
  };

  return (
    <div className="max-width-90 mx-auto py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold mb-0">Media Library</h1>
        <div className="d-flex gap-2">
          {/* <Form.Control
            type="text"
            placeholder="Search..."
            style={{ width: "200px" }}
          /> */}
          <Button
            className="custom-button-bgcolor"
            variant="primary"
            onClick={() => setShowAssetModal(true)}
          >
            Add Asset
          </Button>
          <Button
            className="custom-hover-border bg-white"
            onClick={() => setShowFolderModal(true)}
          >
            Add Folder
          </Button>
          {currentFolder !== "/" && (
            <Button variant="danger" onClick={() => btnDeleteFolder()}>
              Delete Folder
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Processing />
      ) : (
        <>
          <FolderList folders={folderName} onFolderClick={handleFolderClick} />
          <FileList files={folderName} onDeleteFile={handleDeleteFile} />
        </>
      )}

      <AddAssetModal
        show={showAssetModal}
        onHide={() => btnHide()}
        onSubmit={handleAddFile}
      />
      <AddFolderModal
        show={showFolderModal}
        onHide={() => btnHide()}
        onSubmit={handleAddFolder}
      />
    </div>
  );
};
const MediaLibraryWithProvider = () => (
  <FolderTreeProvider>
    <MediaLibrary />
  </FolderTreeProvider>
);
export default MediaLibraryWithProvider;
