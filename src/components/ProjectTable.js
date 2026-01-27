import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import React, { useEffect, useState } from "react";
import { Modal } from 'react-bootstrap'; // Import Modal from react-bootstrap
import DataTable from "react-data-table-component";
import { Link, useNavigate } from 'react-router'; // Correct import for React Router
import DeleteIcon from "../img/delete-icon.svg";
import EditIcon from "../img/edit-icon.svg";
import HistoryIcon from "../img/history-icon.svg";
import ViewIcon from "../img/view-icon.svg";

export default function ProjectDataTable() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedProject, setSelectedProject] = useState(null); // State to hold selected project details
  const [showHistoryModal, setShowHistoryModal] = useState(false); // State to control history modal visibility
  const [historyData, setHistoryData] = useState(null); // State to hold history data
  const [executionPlanningData, setExecutionPlanningData] = useState(null); // State to hold execution planning data
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode

  // Fetch data from the backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/project/view");
        setProjects(response.data.Datas || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch managers from the user API and filter those with Manager role
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/user/view/");
        const allUsers = res.data.files || [];
        const mgrs = allUsers.filter(
          (user) => user.role && user.role.toLowerCase() === "manager"
        );
        setManagers(mgrs);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);

  // Filter projects based on the search query
  const filteredProjects = projects.filter((project) =>
    project.projectName?.toLowerCase().includes(filterText.toLowerCase())
  );

  // Define columns for the data table
  const columns = [
    {
      name: "Project Name",
      selector: (row) => row.projectName,
      sortable: true,
    },
    {
      name: "Manager",
      selector: (row) => row.assigned,
      sortable: true,
    },
    {
      name: "Manager Phone",
      cell: (row) => {
        const manager = managers.find(
          (m) => m.username?.toLowerCase() === row.assigned?.toLowerCase()
        );
        return manager ? <a href={`tel:${manager.phonenumber}`}>{manager.phonenumber}</a> : "--";
      },
      sortable: true,
    },
    {
      name: "Client Name",
      selector: (row) => row.clientName,
      sortable: true,
    },
    {
      name: "Architect Name",
      selector: (row) => row.architectName,
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
      name: "Status",
      selector: (row) => row.currentStage,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <button
            className="btn"
            onClick={() => handleView(row)}
            title="View Project"
          >
            <img src={ViewIcon} alt="" />
          </button>
          <button
            className="btn"
            onClick={() => handleEdit(row._id)}
            title="Edit Project"
          >
            <img src={EditIcon} alt="" />
          </button>
          <button
            className="btn"
            onClick={() => handleDelete(row._id)}
            title="Delete Project"
          >
            <img src={DeleteIcon} alt="" />
          </button>
          <button
            className="btn"
            onClick={() => handleViewHistory(row._id)}
            title="View History"
          >
            <img src={HistoryIcon} alt="" />
          </button>
        </>
      ),
    },
  ];

  // Handle view button click
  const handleView = (project) => {
    setSelectedProject(project); // Set the selected project
    setShowModal(true); // Show the modal
  };

  // Handle edit button click
  const handleEdit = (id) => {
    navigate(`edit-project`); // Navigate to EditProject with the project ID
  };
  
  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`http://localhost:5000/project/delete/${id}`);
        alert("Project deleted successfully!");
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== id));
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  // Handle view history button click
  const handleViewHistory = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/executinPlanning/files/proj/${id}`);
      setExecutionPlanningData(response.data); // Update to access execution planning data correctly
      setShowHistoryModal(true); // Show the history modal
    } catch (error) {
      console.error("Error fetching project history:", error);
    }
  };

  // Close modal
  const handleClose = () => {
    setShowModal(false);
    setSelectedProject(null); // Clear selected project
  };

  return (
    <div className="project-table-container padd-common-16 mt-4">
      <div className="d-flex justify-content-between">
        <h3>Total ABC</h3>
       <div className="d-flex gap-3" >
        {/* <Link to="/projects-list" className="mb-3">
          <button className="add-pjt-btn">View All</button>
        </Link> */}
          <div className="mb-3">
        <input
          type="text"
          placeholder="Search Projects..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="form-control"
        />
      </div>
        <Link to="/project" className="mb-3">
          <button className="add-pjt-btn">Add Project</button>
        </Link>
        </div>
      </div>

      {/* Search Bar */}
    

      <DataTable
        className="data-table" // Apply the custom class here
        columns={columns}
        data={filteredProjects}
        progressPending={loading}
        pagination
        highlightOnHover
      />

      {/* Bootstrap Modal for Project Details */}
      <Modal className="" show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Project Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="align-items-start">
          {selectedProject && (
            <div>
              <h6>General Details</h6>
              <p><b>Project Name:</b> {selectedProject.projectName}</p>
              <p><b>Assigned To:</b> {selectedProject.assigned}</p>
              <p><b>Start Date:</b> {new Date(selectedProject.startDate).toLocaleDateString()}</p>
              <p><b>End Date:</b> {new Date(selectedProject.endDate).toLocaleDateString()}</p>
              <p><b>Status:</b> {selectedProject.currentStage}</p>
              <p><b>Address:</b> {selectedProject.fullAddress}</p>
              <p><b>Pincode:</b> {selectedProject.pincode}</p>
              <p><b>City:</b> {selectedProject.city}</p>

              <h6 className="py-2">Client Details</h6>
              <p><b>Client Name:</b> {selectedProject.clientName}</p>
              <p><b>Client Email Address:</b> {selectedProject.emailAddress}</p>
              <p><b>Client Phone Number:</b> {selectedProject.contactNumber}</p>
            
              <h6 className="py-2">Architect Details</h6>
              <p><b>Architect Name:</b> {selectedProject.architectName}</p>
              <p><b>Architect Company Name:</b> {selectedProject.architectCompanyName}</p>
              <p><b>Architect Phone Number:</b> {selectedProject.architectPhone}</p>
              <p><b>Architect Email Address:</b> {selectedProject.architectEmail}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="common-btn" variant="secondary" onClick={handleClose}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Modal for Project Execution Planning */}
      <Modal className="text-center" show={showHistoryModal} onHide={() => setShowHistoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Project Execution Planning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {executionPlanningData ? (
            <div className="project-table-container padd-common-16 planning-container">
              <h4 className="mb-3">Project Plan Details</h4>
              <table>
                <thead>
                  <tr>
                    <th>Project Status</th>
                    <th>Planned Date</th>
                    <th>Actual Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'Project_Start', 'Basic_Drawing', 'Presentation', 'Quotation', 'Measurement',
                    'Shop_Drawing', 'Final_Drawing', 'Purchase', 'Material_Received',
                    'Snag_List', 'Dispatch', 'Installation', 'Payment'
                  ].map((status, index) => (
                    <tr key={index}>
                      <td>{status.replace(/_/g, ' ')}</td>
                      <td>
                        {executionPlanningData.files && executionPlanningData.files[status] && executionPlanningData.files[status].Execution_date ? (
                            <span>{new Date(executionPlanningData.files[status].Execution_date).toLocaleDateString()}</span>
                        ) : (
                            <span>--</span>
                        )}
                      </td>
                      <td>
                        {executionPlanningData.files && executionPlanningData.files[status] && executionPlanningData.files[status].Final_Date ? (
                            <span>{new Date(executionPlanningData.files[status].Final_Date).toLocaleDateString()}</span>
                        ) : (
                            <span>--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Loading execution planning data...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="common-btn" variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}