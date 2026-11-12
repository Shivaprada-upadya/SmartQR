const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    req.validatedQuery = result.data

    next()
  }
}

export default validateQuery