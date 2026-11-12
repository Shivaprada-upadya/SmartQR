
const requireJsonContentType = (req, res, next) => {
  const methodsRequiringJson = ['POST', 'PUT', 'PATCH']

  if (!methodsRequiringJson.includes(req.method)) {
    return next()
  }

  if (req.is('application/json')) {
    return next()
  }

  const error = new Error('Content-Type must be application/json')
  error.statusCode = 415

  return next(error)
}

export default requireJsonContentType
