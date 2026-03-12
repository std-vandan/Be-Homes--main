import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import UpwardHead from '../components/UpwardHead';

export default function ExecutionPlanning() {
    const [selectedDates, setSelectedDates] = useState(Array(12).fill(null));
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [existingDates, setExistingDates] = useState({});
    const [finalDates, setFinalDates] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('https://behomes-1.onrender.com/project/view');
                setProjects(response.data.Datas);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, []);

    const handleProjectChange = async (e) => {
        const executionId = e.target.value;
        setSelectedProjectId(executionId);

        if (!executionId) {
            setSelectedDates(Array(12).fill(null));
            setExistingDates({});
            setFinalDates({});
            return;
        }

        try {
            const response = await axios.get(`https://behomes-1.onrender.com/executinPlanning/files/proj/${executionId}`);

            const filesData = response.data.files || {};
            // Save the entire filesData and use it for final dates
            setExistingDates(filesData);
            setFinalDates(filesData);

            const statuses = [
                'Project Start', 'Basic Drawing', 'Presentation', 'Quotation', 'Measurement',
                'Shop Drawing', 'Final Drawing', 'Purchase', 'Material Received',
                'Snag List', 'Dispatch', 'Installation', 'Payment'
            ];

            // Map each status to the corresponding execution date using the format expected by the backend, e.g. "Project_Start"
            const datesArray = statuses.map(status => {
                const key = status.replace(/ /g, '_');
                return filesData[key] && filesData[key].Execution_date ? new Date(filesData[key].Execution_date) : null;
            });

            setSelectedDates(datesArray);
        } catch (error) {
            console.error('Error fetching existing dates:', error);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDates.some(date => date !== null)) {
            setError('Please select at least one date.');
            setSuccess('');
            setShowModal(true);
            return;
        }

        setError('');

        try {
            await axios.post(`https://behomes-1.onrender.com/executinPlanning/create/${selectedProjectId}`, {
                Project_Start: { Execution_date: selectedDates[0] },
                Basic_Drawing: { Execution_date: selectedDates[1] },
                Presentation: { Execution_date: selectedDates[2] },
                Quotation: { Execution_date: selectedDates[3] },
                Measurement: { Execution_date: selectedDates[4] },
                Shop_Drawing: { Execution_date: selectedDates[5] },
                Final_Drawing: { Execution_date: selectedDates[6] },
                Purchase: { Execution_date: selectedDates[7] },
                Material_Received: { Execution_date: selectedDates[8] },
                Snag_List: { Execution_date: selectedDates[9] },
                Dispatch: { Execution_date: selectedDates[10] },
                Installation: { Execution_date: selectedDates[11] },
                Payment: { Execution_date: selectedDates[12] },
            });

            setSuccess('Data submitted successfully!');
            setShowModal(true);
        } catch (error) {
            console.error('Error submitting data:', error);
            setError('Error submitting data. Please try again.');
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setError('');
        setSuccess('');
    };

    return (
        <>
            <UpwardHead pageTitle="Execution Planning" />
            <div className="padd-common-16 mb-3 px-4">
                <label htmlFor="projectSelect" className="project-form-label">Select Project:</label>
                <select
                    id="projectSelect"
                    className="project-form-control"
                    value={selectedProjectId}
                    onChange={handleProjectChange}
                >
                    <option value="">-- Select a Project --</option>
                    {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                            {project.projectName}
                        </option>
                    ))}
                </select>
            </div>

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
                            'Project Start', 'Basic Drawing', 'Presentation', 'Quotation', 'Measurement',
                            'Shop Drawing', 'Final Drawing', 'Purchase', 'Material Received',
                            'Snag List', 'Dispatch', 'Installation', 'Payment'
                        ].map((status, index) => {
                            const key = status.replace(/ /g, '_'); // backend key format
                            return (
                                <tr key={index}>
                                    <td>{status}</td>
                                    <td>
                                        <div className="date-picker-container text-center">
                                            <FaCalendarAlt className="date-icon" />
                                            <DatePicker
                                                className="project-form-control"
                                                selected={selectedDates[index]}
                                                onChange={(date) => {
                                                    const newDates = [...selectedDates];
                                                    newDates[index] = date;
                                                    setSelectedDates(newDates);
                                                }}
                                                dateFormat="yyyy/MM/dd"
                                                placeholderText="Click to select a date"
                                                disabled={!selectedProjectId}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        {finalDates && finalDates[key] && finalDates[key].Final_Date ? (
                                            <span>{finalDates[key].Final_Date}</span>
                                        ) : (
                                            <span>--</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <button onClick={handleSubmit} className="gradient-button">Submit</button>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{error ? 'Error' : 'Success'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{error ? error : success}</Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
