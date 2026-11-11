
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase()
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
    if (error.code === '23505') {
      const conflictError = new Error('Email is already registered')
      conflictError.statusCode = 409
      throw conflictError
    }

    throw error
  }
}

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase()

  const result = await pool.query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE LOWER(email) = $1`,
    [normalizedEmail],
  )

  const user = result.rows[0]

  if (!user) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password_hash,
  )

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
  )

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    },
    token,
  }
}


export const getUserProfile = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = $1`,
    [userId],
  )

  if (result.rows.length === 0) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  return result.rows[0]
}

