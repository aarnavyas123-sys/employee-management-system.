const employeeRepository = require("../repositories/employeeRepository");

class EmployeeService {
  async createEmployee(data) {
    if (data.salary < 0) {
      throw new Error("Salary cannot be negative");
    }

    return await employeeRepository.create(data);
  }

  async getEmployees(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const offset = (page - 1) * limit;

    const search = query.search || "";

    return await employeeRepository.findAll(limit, offset, search);
  }

  async getEmployee(id) {
    const employee = await employeeRepository.findById(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    return employee;
  }

  async updateEmployee(id, data) {
    return await employeeRepository.update(id, data);
  }

  async deleteEmployee(id) {
    return await employeeRepository.delete(id);
  }
}

module.exports = new EmployeeService();
