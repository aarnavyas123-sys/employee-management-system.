const pool = require("../config/db");

class EmployeeRepository {
  async create(data) {
    const { name, department_id, phone, address, designation, salary } = data;

    const result = await pool.query(
      `
      INSERT INTO employee_profiles
      (name, department_id, phone, address, designation, salary)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [name, department_id, phone, address, designation, salary],
    );

    return result.rows[0];
  }

  async findAll(limit, offset, search) {
    let query = `
      SELECT
      ep.id,
      ep.name,
      ep.department_id,
      d.department_name,
      ep.designation,
      ep.salary,
      ep.phone,
      ep.address
      FROM employee_profiles ep
      LEFT JOIN departments d
      ON ep.department_id = d.id
    `;

    const values = [];

    if (search) {
      query += ` WHERE ep.name ILIKE $1 `;
      values.push(`%${search}%`);
    }

    query += `
      ORDER BY ep.id DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);

    const result = await pool.query(query, values);

    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `
      SELECT *
      FROM employee_profiles
      WHERE id=$1
      `,
      [id],
    );

    return result.rows[0];
  }

  async update(id, data) {
    const { name, department_id, phone, address, designation, salary } = data;

    const result = await pool.query(
      `
      UPDATE employee_profiles
      SET
      name=$1,
      department_id=$2,
      phone=$3,
      address=$4,
      designation=$5,
      salary=$6
      WHERE id=$7
      RETURNING *
      `,
      [name, department_id, phone, address, designation, salary, id],
    );

    return result.rows[0];
  }

  async delete(id) {
    await pool.query(`DELETE FROM employee_profiles WHERE id=$1`, [id]);

    return true;
  }
}

module.exports = new EmployeeRepository();
