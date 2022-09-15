const getLogger =  require("./lokilogs");
 
const logError = (err, req, res, next) => {
    let method = req.method
    let url = req.url
    let status = res.statusCode
 
    const logger = getLogger
    logger.error({ message: `method=${method} url=${url} status=${status} level=error error=${err.stack}`, labels: { 'origin': 'api' } })

    return next();
}

module.exports = logError