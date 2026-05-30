// src/context/PassContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api, { passAPI } from "../services/api";

const PassContext = createContext();

export const PassProvider = ({ children }) => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all passes on mount
  // useEffect(() => {
  //   fetchAllPasses();
  // }, []);

  // Get all passes from backend for Warden
  const fetchAllPasses = async () => {
    try {
      setLoading(true);
      const response = await passAPI.getPendingPasses();  // Use pending endpoint
      setPasses(response.data);
    } catch (error) {
      console.error("Error fetching passes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create pass via API
  const addPass = async (passData) => {
    try {
      setLoading(true);
      const response = await passAPI.createPass(passData);
      setPasses(prev => [...prev, response.data]);
      return { success: true, pass: response.data };
    } catch (error) {
      console.error("Error creating pass:", error);
      return { success: false, error: error.response?.data?.detail };
    } finally {
      setLoading(false);
    }
  };

  // Update pass status via API
  const updatePassStatus = async (passId, newStatus, remark) => {
    try {
      setLoading(true);
      const response = await passAPI.updatePassStatus(passId, newStatus, remark);
      setPasses(prev => prev.map(pass => 
        pass.pass_id === passId ? response.data : pass
      ));
      return { success: true };
    } catch (error) {
      console.error("Error updating pass:", error);
      return { success: false, error: error.response?.data?.detail };
    } finally {
      setLoading(false);
    }
  };

  // Get passes for current student
  const getMyPasses = async () => {
    try {
      setLoading(true);
      const response = await passAPI.getMyPasses();
      return response.data;
    } catch (error) {
      console.error("Error fetching my passes:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get pending passes (for warden)
  const getPendingPasses = async () => {
    try {
      setLoading(true);
      const response = await passAPI.getPendingPasses();
      return response.data;
    } catch (error) {
      console.error("Error fetching pending passes:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getLateReturns = async () =>{
    try {
      const response = await passAPI.getLateReturns();
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  const addPassRemark = async (passId, remark) => {
      try {
        setLoading(true);
        const response = await passAPI.addPassRemark(passId, remark);

        setPasses(prev => prev.map(pass => pass.pass_id === passId ? { ...pass, remark : response.data.pass.remark} : pass));

        return { success : true, pass : response.data}
      } catch (error) {
        console.error("Error adding remark:", error);
        return { success: false, error: error.response?.data?.detail };
      }finally{
        setLoading(false);
      }
  }

  return (
    <PassContext.Provider value={{ 
      passes, 
      loading,
      addPass, 
      updatePassStatus,
      getMyPasses,
      getPendingPasses,
      fetchAllPasses,
      getLateReturns,
      addPassRemark
    }}>
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => useContext(PassContext);
