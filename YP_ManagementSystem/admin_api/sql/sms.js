module.exports = {
    addSms: "  INSERT INTO t_spb_sms (PhoneNum,Content,SendTime,IsSuc,Operator) VALUES(?,?,?,?,?) ",

    getSmsList: " select ID, PhoneNum,Content,SendTime,IsSuc, Operator from t_spb_sms where ( (ifnull({phonenum},'')='' or phonenum ={phonenum})) and ( (ifnull({sendstarttime},'')='' or sendtime >={sendstarttime})) and ( (ifnull({sendendtime},'')='' or sendtime <{sendendtime})) and ( (ifnull({issuc},'')='' or issuc ={issuc})) order by ID desc limit {start},{size} ; select count(1) as count from t_spb_sms where ( (ifnull({phonenum},'')='' or phonenum ={phonenum})) and ( (ifnull({sendstarttime},'')='' or sendtime >={sendstarttime})) and ( (ifnull({sendendtime},'')='' or sendtime <{sendendtime})) and ( (ifnull({issuc},'')='' or issuc ={issuc})) " 
    
}
