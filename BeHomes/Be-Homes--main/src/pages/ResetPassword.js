import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

export default function ProjectDataTable() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("https://behomes-1.onrender.com/project");
        setProjects(response.data.Datas || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Define columns for the data table
  const columns = [
    {
      name: "Project Name",
      selector: (row) => row.projectName,
      sortable: true,
    },
    {
      name: "Project Type",
      selector: (row) => row.projectType,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) => new Date(row.startDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) => new Date(row.endDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Client Name",
      selector: (row) => row.clientName,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={() => handleEdit(row._id)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  // Handle edit button click
  const handleEdit = (id) => {
    alert(`Edit project with ID: ${id}`);
    // Redirect or show edit modal
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`https://behomes-1.onrender.com/api/projects/delete/${id}`);
        alert("Project deleted successfully!");
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== id));
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h3>Project Data Table</h3>
      <DataTable
        columns={columns}
        data={projects}
        progressPending={loading}
        pagination
        highlightOnHover
      />
    </div>
  );
}
