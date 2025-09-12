import React, { createContext, useContext, useState } from "react";

const FolderTreeContext = createContext();

export const FolderTreeProvider = ({ children }) => {
  console.log("FolderTreeProvider rendering");
  const [folderTree, setFolderTree] = useState([
    {
      name: "EyesOpen",
      subfolders: [],
      files: [],
    },
    {
      name: "eyesDealErp",
      subfolders: [
        {
          name: "stores",
          subfolders: [
            {
              name: "deepFolder",
              subfolders: [],
              files: [
                {
                  name: "DeepImage.png",
                  url: "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/DeepImage.png",
                },
              ],
            },
          ],
          files: [
            {
              name: "StoreImage.png",
              url: "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/StoreImage.png",
            },
          ],
        },
      ],
      files: [],
    },
    {
      name: "eyesdeal",
      subfolders: [],
      files: [],
    },
    {
      name: "formats",
      subfolders: [],
      files: [
        {
          name: "EyesO_1.png",
          url: "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/EyesO_1.png",
        },
      ],
    },
  ]);

  return (
    <FolderTreeContext.Provider value={{ folderTree, setFolderTree }}>
      {children}
    </FolderTreeContext.Provider>
  );
};

export const useFolderTree = () => {
  const context = useContext(FolderTreeContext);
  if (!context) {
    throw new Error("useFolderTree must be used within a FolderTreeProvider");
  }
  return context;
};
