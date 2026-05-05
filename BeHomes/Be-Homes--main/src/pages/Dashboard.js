import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DashCard from '../components/DashCard';
import ProjectDataTable from '../components/ProjectTable';
import UpwardHead from '../components/UpwardHead';
import PaymentsIcon from "../img/payment-dash-icon.svg";
import PaymentOverdueIcon from "../img/payment-overdue-icon.svg";
import ProjectIcon from "../img/project-icon.svg";
import ProjectOverdueIcon from "../img/project-overdue-icon.svg";
import UserIcon from "../img/user-icon.svg";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [unapprovedCount, setUnapprovedCount] = useState(0);
  const [prospectCount, setProspectCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  // Fetch all project data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("https://behomes-1.onrender.com/project/view");
        setProjects(response.data.Datas || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Fetch counts for prospects and projects from backend
  useEffect(() => {
    const fetchProjectCounts = async () => {
      try {
        const response = await axios.get("https://behomes-1.onrender.com/project/Projects_Overdue");
        // Assuming the backend returns { msg:"Success", Prospect: <number>, Project: <number> }
        setProspectCount(response.data.Prospect);
        setProjectCount(response.data.Project);
      } catch (error) {
        console.error("Error fetching project counts:", error);
      }
    };

    fetchProjectCounts();
  }, []);

  // Fetch user data and calculate total and unapproved counts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://behomes-1.onrender.com/user/view");
        const users = response.data; // Assuming response.data returns an array of users
        setUserCount(users.length);
        // Filter users where role === "Unapproved"
        const unapprovedUsers = users.filter(user => user.role === "Unapproved");
        setUnapprovedCount(unapprovedUsers.length);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <UpwardHead pageTitle="Dashboard" navtitle="Dashboard" />
      <div className="padd-common-16 mx-2">
        <div className="row">
          <div className="col-md-4 col-lg-3 mb-3 ">
            <Link to="prospects-list">
              <DashCard title="Prospects" image={ProjectIcon} counter={prospectCount} />
            </Link>
          </div>
          <div className="col-md-4 col-lg-3 ">
            <Link to="projects-list">
              <DashCard title="Projects" image={ProjectIcon} counter={projectCount} />
            </Link>
          </div>
          <div className="col-md-4 col-lg-3 ">
            <DashCard title="Projects Overdue" image={ProjectOverdueIcon} counter="10" />
          </div>
          <div className="col-md-4 col-lg-3 ">
            <DashCard title="Prospect Payment" image={PaymentsIcon} counter="₹89,000" />
          </div>
          <div className="col-md-4 col-lg-3 ">
            <DashCard title="Payment Overdue" image={PaymentOverdueIcon} counter="₹12,000" />
          </div>
          <div className="col-md-4 col-lg-3 ">
            <Link to="user-listing">
              <DashCard
                title="Users"
                image={UserIcon}
                counter={`Total: ${userCount} | Pending: ${unapprovedCount}`}
              />
            </Link>
          </div>
        </div>
      </div>
      <ProjectDataTable />
    </>
  );
}