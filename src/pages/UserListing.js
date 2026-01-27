import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import UpwardHead from '../components/UpwardHead';

function CustomButton({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} className="approved-btn px-4 py-2 text-white rounded disabled:opacity-50">
      {children}
    </button>
  );
}

function CustomSelect({ onChange, placeholder, options }) {
  return (
    <select defaultValue="" onChange={(e) => onChange(e.target.value)} className="border p-2 rounded">
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [filterText, setFilterText] = useState('');
  const [approvalFilter, setApprovalFilter] = useState("all"); // new state for filtering pending approval

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/user/view/");
      setUsers(res.data.files);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleApprove = async (userId) => {
    if (!selectedRoles[userId]) return;
    try {
      await axios.post(`http://localhost:5000/user/role-assign/${userId}`, { role: selectedRoles[userId] });
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  // Filter users by search text and approval filter status
  const filteredUsers = users.filter((user) => {
    const searchCondition =
      (user.username && user.username.toLowerCase().includes(filterText.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(filterText.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(filterText.toLowerCase()));

    if (approvalFilter === "pending") {
      return searchCondition && user.role === "Unapproved";
    }
    return searchCondition;
  });

  const columns = [
    { name: "Name", selector: (row) => row.username, sortable: true },
    { 
      name: "Phone Number", 
      cell: (row) => <a href={`tel:${row.phonenumber}`}>{row.phonenumber}</a>, 
      sortable: true 
    },
    { 
      name: "Email", 
      cell: (row) => <a href={`mailto:${row.email}`}>{row.email}</a>, 
      sortable: true 
    },
    { name: "Current Role", selector: (row) => row.role, sortable: true },
    {
      name: "Assign Role",
      cell: (row) => (
        <CustomSelect 
          onChange={(value) => handleRoleChange(row._id, value)}
          placeholder="Select role"
          options={[
            { value: "User", label: "User" }, 
            { value: "Admin", label: "Admin" }, 
            { value: "Manager", label: "Manager" }, 
            { value: "Finance", label: "Finance" },
            { value: "Team Member", label: "Team Member" },
            { value: "Account", label: "Account" },
            { value: "Client", label: "Client" },
            { value: "Designer", label: "Designer" }
          ]}
        />
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <CustomButton onClick={() => handleApprove(row._id)} disabled={!selectedRoles[row._id]}>
          Approve
        </CustomButton>
      ),
    },
  ];

  return (
    <div className="padd-common-16">
      <UpwardHead pageTitle="User Listing" />
      
      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search Users..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Approval Filter Dropdown */}
      <div className="mb-3">
        <select 
          className="form-control"
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="pending">Pending Approval</option>
        </select>
      </div>
      
      <DataTable
        columns={columns}
        data={filteredUsers}
        pagination
        highlightOnHover
      />
    </div>
  );
}
