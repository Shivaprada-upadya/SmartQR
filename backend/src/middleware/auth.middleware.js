
import jwt from 'jsonwebtoken'

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  // Check whether the Authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required',
    })
  }

  // Extract JWT from the Bearer header
  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach authenticated user information to request
    req.user = {
      userId: decoded.userId,
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    })
  }
}

export default authenticate
