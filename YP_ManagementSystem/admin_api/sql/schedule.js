module.exports = {
    deleteSessionExpired: "DELETE FROM _mysql_session_store where expires<{time}"
}