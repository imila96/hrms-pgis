import React, { useEffect, useState } from "react";
import axiosInstance from "../../AxiosInstance";

// This wrapper fetches the same employee data as PersonnelOversight
// but exposes it via props instead of internal state.
export default function PersonnelOversightWithData({ onData }) {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(
          "http://localhost:8080/hr/employees"
        );
        setEmployees(data);
        if (onData) onData(data); // send data upward
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [onData]);

  return null; // invisible, just fetches data
}
