import bcrypt from 'bcryptjs'
import pool from '../config/database.js'

export const registerUser = async ({ name, email, password }) => {
  // Normalize email
  const normalizedEmail = email.toLowerCase()

  // Hash password before database insertion
  const passwordHash = await bcrypt.hash(password, 12)

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, normalizedEmail, passwordHash],
    )

    return result.rows[0]
  } catch (error) {
    // PostgreSQL unique constraint violation
    if (error.code === '23505') {
      const conflictError = new Error('Email is already registered')
      conflictError.statusCode = 409
      throw conflictError
    }

    throw error
  }
}