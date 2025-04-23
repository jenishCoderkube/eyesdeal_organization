import React from "react";
import { Card, Button } from "react-bootstrap";

const FileList = ({ files, onDeleteFile }) => (
  <div>
    <h2 className="h4">Files</h2>
    <div className="row mt-3">
      {files.map((file) => (
        <div key={file.name} className="col-md-4 mb-3">
          <Card className="h-100 shadow-none border">
            <div
              className="p-3 d-flex justify-content-center align-items-center"
              style={{ height: "200px" }}
            >
              <img
                src={file.url}
                alt={file.name}
                className="img-fluid"
                style={{ maxHeight: "100%" }}
              />
            </div>
            <Card.Footer className="bg-light d-flex justify-content-between align-items-center">
              <span className="text-truncate">{file.name}</span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteFile(file.name)}
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

export default FileList;
