import pool from "../config/db.js";

// Create user
const createUser = async (name, email, password, verificationCode) => {
    const result = await pool.query(
        'insert into users (name, email, password, verification_code) values ($1, $2, $3, $4) returning *',
        [name, email, password, verificationCode]
    );

    return result.rows[0];
};


// Get user by email
const getUserByEmail = async (email) => {
    const result = await pool.query('select * from users where email = $1', [email]);
    return result.rows[0];
};

// Verify user email
const verifyUserEmail = async (email) => {
    const result = await pool.query('update users set is_verified = true where email = $1 returning *', [email]);
    return result.rows[0];
}

// Update user's reset code 
const updateUserResetCode = async (email, resetCode) => {
    // Set expiration time 30 minutes from now 
    const resetCodeExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const result = await pool.query(
        'update users set reset_code = $1, reset_code_expires = $2 where email=$3 returning *',
        [resetCode, resetCodeExpires, email]
    );

    return result.rows[0];
};

// Update user's password and clear reset code
const updateUserPassword = async (email, newPassword) => {
    const result = await pool.query(
        'update users set password=$1, reset_code=NULL, reset_code_expires=NULL where email=$2 returning *',
        [newPassword, email]
    );

    return result.rows[0];
}

export { createUser, getUserByEmail, verifyUserEmail, updateUserPassword, updateUserResetCode }

