import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import FolderList from "../../components/MediaLibrary/FolderList";
import FileList from "../../components/MediaLibrary/FileList";
import AddAssetModal from "../../components/MediaLibrary/AddAssetModal";
import AddFolderModal from "../../components/MediaLibrary/AddFolderModal";
import { useFolderTree } from "./FolderTreeContext";

const MediaLibrary = () => {
  const navigate = useNavigate();
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const { folderTree, setFolderTree } = useFolderTree();

  // Root level: all top-level folders and their files
  const subfolders = folderTree;
  const files = folderTree.flatMap((folder) => folder.files);

  const handleFolderClick = (folderName) => {
    console.log("Navigating to folder:", folderName);
    navigate(`/media-library/${folderName}`);
  };

  const handleDeleteFile = (fileName) => {
    console.log("Deleting file at root:", fileName);
    setFolderTree((prevTree) =>
      prevTree.map((folder) => ({
        ...folder,
        files: folder.files.filter((file) => file.name !== fileName),
      }))
    );
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

  return (
    <div className="max-width-90 mx-auto py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold mb-0">Media Library</h1>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Search..."
            style={{ width: "200px" }}
          />
          <Button variant="primary" onClick={() => setShowAssetModal(true)}>
            Add Asset
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => setShowFolderModal(true)}
          >
            Add Folder
          </Button>
        </div>
      </div>

      <FolderList folders={subfolders} onFolderClick={handleFolderClick} />
      <FileList files={files} onDeleteFile={handleDeleteFile} />

      <AddAssetModal
        show={showAssetModal}
        onHide={() => setShowAssetModal(false)}
        onSubmit={handleAddFile}
      />
      <AddFolderModal
        show={showFolderModal}
        onHide={() => setShowFolderModal(false)}
        onSubmit={handleAddFolder}
      />
    </div>
  );
};

export default MediaLibrary;
