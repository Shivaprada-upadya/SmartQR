
const hppProtection = (req, res, next) => {
  const query = req.query

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      return res.status(400).json({
        success: false,
        code: 'DUPLICATE_QUERY_PARAMETER',
        message: `Duplicate query parameter: ${key}`,
      })
    }
  }

  next()
}

export default hppProtection
