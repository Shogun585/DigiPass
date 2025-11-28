// src/context/PassContext.jsx
import React, { createContext, useContext, useState } from "react";

const PassContext = createContext();

export const PassProvider = ({ children }) => {
  const [passes, setPasses] = useState([]);

  // Add a new pass
  const addPass = (passData) => {
    setPasses(prev => [...prev, { ...passData, id: prev.length + 1 }]);
  };

  // Update pass status
  const updatePassStatus = (passId, newStatus) => {
    setPasses(prev => prev.map(pass => 
      pass.id === passId ? { ...pass, status: newStatus } : pass
    ));
  };

  return (
    <PassContext.Provider value={{ passes, addPass, updatePassStatus }}>
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => useContext(PassContext);
