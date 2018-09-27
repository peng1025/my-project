module.exports = {
    login: "select ID,Name,OrgID from t_user where UserName=? and Password=? and Deflag=0 and Status != 0 limit 1",
    regist: "insert into koa_user(UserName,`Password`) values(?,?)",
    exitisUser: "select ID from koa_user where UserName=? limit 1",
    deleteSessionExpired: "DELETE FROM _mysql_session_store where expires<{time}",
    getExportSession: "select id,expires,`data` from _mysql_session_store limit 100",
    addSong: "INSERT INTO song (Name, Time, Mem) VALUES ({Name}, {Time}, {Mem})",
    updateSong: "update song set Mem=concat(Mem,'12') where ID={ID}",
    querySong: "select * from song where Mem={Mem}",
    updateLastLoginTime: "update t_user set LastLoginTime=? where ID=? "
}