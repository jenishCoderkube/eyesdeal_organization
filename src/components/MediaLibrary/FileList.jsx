import React from "react";
import { Card, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { mediaService } from "../../services/mediaService";
function getFileName(filePath) {
  if (!filePath) return "";
  return filePath.split("/").pop();
}

const FileList = ({ files, onDeleteFile }) => {
  return (
    <div>
      <h2 className="h4">Files</h2>
      <div className="row mt-3">
        {files?.resp?.Contents?.map((file) => (
          <div key={file.Key} className="col-md-4 mb-3">
            <Card className="shadow-none border">
              <div
                className="p-3 d-flex justify-content-center align-items-center"
                style={{ height: "200px" }}
              >
                <img
                  src={files?.baseUrl + file.Key}
                  alt={file.Key}
                  className="img-fluid"
                  style={{ maxHeight: "100%" }}
                />
              </div>
              <Card.Footer className="bg-light d-flex justify-content-between align-items-center">
                <span className="text-truncate">{getFileName(file.Key)}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeleteFile(file.Key)}
                >
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
