import React from "react";
import { Card } from "react-bootstrap";
import { FaFolder } from "react-icons/fa";
function getLastPathSegment(path) {
  if (!path) return "";
  const segments = path.split("/").filter(Boolean); // filter removes empty strings
  return segments[segments.length - 1] || "";
}

const FolderList = ({ folders, onFolderClick }) => (
  <>
    {" "}
    <h2 className="h4">Folders</h2>
    <div className="row mt-3">
      {folders?.resp?.CommonPrefixes?.map((folder) => (
        <div
          key={folder.Prefix}
          className="col-md-3 text-center mb-3 cursor-pointer"
          onClick={() => onFolderClick(folder.Prefix)}
        >
          <FaFolder size={70} color="#6c757d" />
          <p className="mt-2 text-truncate">
            {getLastPathSegment(folder.Prefix)}
          </p>
        </div>
      ))}
    </div>
  </>
);

export default FolderList;
