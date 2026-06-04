import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function Skills() {
  const [skillName, setSkillName] = useState("");
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await API.get("/skills");
      setSkills(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to Fetch Skills");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();

    if (!skillName.trim()) {
      toast.error("Please Enter Skill Name");
      return;
    }

    try {
      await API.post("/skills", {
        skill_name: skillName,
      });

      toast.success("Skill Added Successfully ✅");

      setSkillName("");

      fetchSkills();
    } catch (error) {
      toast.error("Failed to Add Skill");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Skill?")) return;

    try {
      await API.delete(`/skills/${id}`);

      toast.success("Skill Deleted Successfully ✅");

      fetchSkills();
    } catch (error) {
      console.log(error);

      toast.error("Cannot delete skill. It may be assigned to employees.");
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Skills Management</h2>

            <span className="badge bg-primary fs-6">
              Total Skills: {skills.length}
            </span>
          </div>

          <form onSubmit={handleAddSkill}>
            <input
              className="form-control mb-3"
              placeholder="Enter Skill Name"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />

            <button type="submit" className="btn btn-primary mb-4">
              Add Skill
            </button>
          </form>

          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Skill Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.id}</td>
                    <td>{skill.skill_name}</td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(skill.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No Skills Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Skills;
