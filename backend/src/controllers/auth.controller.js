
import { registerUser, loginUser, getUserProfile } from '../services/auth.service.js'

export const register = async (req, res) => {
  const user = await registerUser(req.body)

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
  })
}

export const login = async (req, res) => {
  const result = await loginUser(req.body)

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  })
}

export const getMe = async (req, res) => {
  const user = await getUserProfile(req.user.userId)

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user },
  })
}
