import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import FolderList from "../../components/MediaLibrary/FolderList";
import FileList from "../../components/MediaLibrary/FileList";
import AddAssetModal from "../../components/MediaLibrary/AddAssetModal";
import AddFolderModal from "../../components/MediaLibrary/AddFolderModal";
import { useFolderTree } from "./FolderTreeContext";

const SubFolder = () => {
  const { folderPath } = useParams();
  const [currentSubPath, setCurrentSubPath] = useState([]); // Tracks subfolder path, e.g., ["stores", "deepFolder"]
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const { folderTree, setFolderTree } = useFolderTree();

  // Get current folder's subfolders and files
  const getCurrentFolder = () => {
    console.log("folderPath:", folderPath, "currentSubPath:", currentSubPath);

    // Find the root folder from folderPath
    const rootFolder = folderTree.find((f) => f.name === folderPath);
    if (!rootFolder) {
      console.log("Root folder not found:", folderPath);
      return { subfolders: [], files: [] };
    }

    // If no subpath, return the root folder's contents
    if (currentSubPath.length === 0) {
      const result = {
        subfolders: rootFolder.subfolders,
        files: rootFolder.files,
      };
      console.log(
        "Root folder contents - subfolders:",
        result.subfolders,
        "files:",
        result.files
      );
      return result;
    }

    // Traverse to the current subfolder
    let currentFolder = rootFolder;
    let folders = rootFolder.subfolders;

    for (const part of currentSubPath) {
      const folder = folders.find((f) => f.name === part);
      if (!folder) {
        console.log("Invalid subpath, returning empty:", part);
        return { subfolders: [], files: [] };
      }
      currentFolder = folder;
      folders = folder.subfolders;
    }

    const result = {
      subfolders: currentFolder.subfolders,
      files: currentFolder.files,
    };
    console.log(
      "Subfolder contents - subfolders:",
      result.subfolders,
      "files:",
      result.files
    );
    return result;
  };

  const { subfolders, files } = getCurrentFolder();

  const handleFolderClick = (folderName) => {
    console.log("Clicked folder:", folderName, "Updating subpath to:", [
      ...currentSubPath,
      folderName,
    ]);
    setCurrentSubPath([...currentSubPath, folderName]);
  };

  const handleBack = () => {
    if (currentSubPath.length > 0) {
      const newSubPath = currentSubPath.slice(0, -1);
      console.log("Going back, new subpath:", newSubPath);
      setCurrentSubPath(newSubPath);
    }
  };

  const handleDeleteFile = (fileName) => {
    console.log(
      "Deleting file:",
      fileName,
      "in path:",
      folderPath,
      currentSubPath
    );
    setFolderTree((prevTree) => {
      const newTree = JSON.parse(JSON.stringify(prevTree)); // Deep copy
      const rootFolder = newTree.find((f) => f.name === folderPath);
      if (!rootFolder) return prevTree;

      let currentFolder = rootFolder;
      let folders = rootFolder.subfolders;

      // Traverse to the current subfolder
      for (const part of currentSubPath) {
        const folder = folders.find((f) => f.name === part);
        if (!folder) return prevTree;
        currentFolder = folder;
        folders = folder.subfolders;
      }

      // Update files in the current folder
      currentFolder.files = currentFolder.files.filter(
        (file) => file.name !== fileName
      );

      return newTree;
    });
  };

  const handleAddFolder = (newFolder) => {
    console.log(
      "Adding folder:",
      newFolder.name,
      "in path:",
      folderPath,
      currentSubPath
    );
    setFolderTree((prevTree) => {
      const newTree = JSON.parse(JSON.stringify(prevTree)); // Deep copy
      const rootFolder = newTree.find((f) => f.name === folderPath);
      if (!rootFolder) return prevTree;

      let currentFolder = rootFolder;
      let folders = rootFolder.subfolders;

      // Traverse to the current subfolder
      for (const part of currentSubPath) {
        const folder = folders.find((f) => f.name === part);
        if (!folder) return prevTree;
        currentFolder = folder;
        folders = folder.subfolders;
      }

      // Add new folder to the current folder's subfolders
      currentFolder.subfolders.push({
        name: newFolder.name,
        subfolders: [],
        files: [],
      });

      return newTree;
    });
  };

  const handleAddFile = (newFile) => {
    console.log(
      "Adding file:",
      newFile.name,
      "in path:",
      folderPath,
      currentSubPath
    );
    setFolderTree((prevTree) => {
      const newTree = JSON.parse(JSON.stringify(prevTree)); // Deep copy
      const rootFolder = newTree.find((f) => f.name === folderPath);
      if (!rootFolder) return prevTree;

      let currentFolder = rootFolder;
      let folders = rootFolder.subfolders;

      // Traverse to the current subfolder
      for (const part of currentSubPath) {
        const folder = folders.find((f) => f.name === part);
        if (!folder) return prevTree;
        currentFolder = folder;
        folders = folder.subfolders;
      }

      // Add file to the current folder
      currentFolder.files.push(newFile);

      return newTree;
    });
  };

  return (
    <div className="max-width-90 mx-auto py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold mb-0">
          Media Library -{" "}
          <span className="fw-normal" style={{ fontSize: "20px" }}>
            {" "}
            {folderPath}/{currentSubPath.join("/")}
          </span>
        </h1>
        <div className="d-flex gap-2">
          {currentSubPath.length > 0 && (
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          )}
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
          <Button variant="danger">Delete Folder</Button>
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

export default SubFolder;
