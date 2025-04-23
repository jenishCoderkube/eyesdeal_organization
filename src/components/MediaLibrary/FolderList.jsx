import React from "react";
import { Card } from "react-bootstrap";
import { FaFolder } from "react-icons/fa";

const FolderList = ({ folders, onFolderClick }) => (
  <>
    {" "}
    <h2 className="h4">Folders</h2>
    <div className="row mt-3">
      {folders.map((folder) => (
        <div
          key={folder.name}
          className="col-md-3 text-center mb-3 cursor-pointer"
          onClick={() => onFolderClick(folder.name)}
        >
          <FaFolder size={70} color="#6c757d" />
          <p className="mt-2 text-truncate">{folder.name}</p>
        </div>
      ))}
    </div>
  </>
);

export default FolderList;
