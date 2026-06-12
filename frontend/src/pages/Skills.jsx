import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function Skills() {
  const [skillName, setSkillName] = useState("");
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await API.get("/skills");
      setSkills(res.data);
    } catch (error) {
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
      toast.error("Cannot delete skill. It may be assigned to employees.");
    }
  };

  const filteredSkills = skills.filter((skill) =>
    skill.skill_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        {/* Header */}
        <div className="card p-4 shadow-sm mb-4">
          <h2 className="fw-bold">Skills Management</h2>

          <p className="text-muted mb-0">
            Manage employee skills and competencies.
          </p>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Skills</h6>
              <h2>{skills.length}</h2>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-3 shadow-sm text-center">
              <h6>Search Results</h6>
              <h2>{filteredSkills.length}</h2>
            </div>
          </div>
        </div>

        {/* Add Skill */}
        <div className="card p-4 shadow-sm mb-4">
          <h4 className="mb-3">Add New Skill</h4>

          <form onSubmit={handleAddSkill}>
            <div className="row">
              <div className="col-md-9">
                <input
                  className="form-control"
                  placeholder="Enter Skill Name"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <button type="submit" className="btn btn-primary w-100">
                  + Add Skill
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Skills List */}
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Skills Directory</h4>

            <input
              type="text"
              className="form-control"
              style={{ width: "280px" }}
              placeholder="🔍 Search Skill"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Skill</th>
                  <th width="150">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill) => (
                    <tr key={skill.id}>
                      <td>#{skill.id}</td>

                      <td>
                        <span className="badge bg-success fs-6">
                          {skill.skill_name}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(skill.id)}
                        >
                          🗑 Delete
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
      </div>
    </>
  );
}

export default Skills;
