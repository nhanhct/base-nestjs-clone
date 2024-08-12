import * as moment from "moment";
export class DateHelper{
  static changeDateToMinute(time:Date){
    let hour =moment(time).hour()
    let minute =moment(time).minute()
    let changeHourToMinute=hour*60
    let sumMinute = changeHourToMinute + minute
    return sumMinute
    // let minute = moment(time).minute
  }
  static changeHourToMinute(hour:number){
    let minute = (hour - parseInt(hour.toString()))*100
    let hourToMinute=(parseInt(hour.toString()))*60
    let totalMinute = minute+hourToMinute
    return totalMinute
  }
    static addMonths(date, months) {
        var d = date.getDate();
        date.setMonth(date.getMonth() + +months);
        if (date.getDate() != d) {
          date.setDate(0);
        }
        return date;
    }
    static timeSince(date)
    { 
        var seconds = Math.floor((+new Date() - date) / 1000);

        var interval = seconds / 31536000;
      
        if (interval > 1) {
          return Math.floor(interval) + " years";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
          return Math.floor(interval) + " months";
        }
        interval = seconds / 86400;
        if (interval > 1) {
          return Math.floor(interval) + " days";
        }
        interval = seconds / 3600;
        if (interval > 1) {
          return Math.floor(interval) + " hours";
        }
        interval = seconds / 60;
        if (interval > 1) {
          return Math.floor(interval) + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }
    static getDate(date: Date)
    {
      const newDate = new Date(date);
      const dateStr = newDate.getFullYear()+"-"+ (newDate.getMonth() +1) +"-"+newDate.getDate();
      const momentDate = moment(dateStr, "YYYY-MM-DD");
      if(momentDate.isValid())
      {
        return new Date(momentDate.toDate());
      }
      return newDate;
    }
    static getSecondsDuration(date1: Date, date2: Date)
    {
      const newDate1 = new Date(date1);
      const newDate2 = new Date(date2);
      const dateStr1 =`${newDate1.getFullYear()}-${(newDate1.getMonth() +1)}-${newDate1.getDate()} ${newDate1.getHours()}:${newDate1.getMinutes()}:${newDate1.getSeconds}`;
      const dateStr2 =`${newDate2.getFullYear()}-${(newDate2.getMonth() +1)}-${newDate2.getDate()} ${newDate2.getHours()}:${newDate2.getMinutes()}:${newDate2.getSeconds}`;
      const momentDate1 = moment(dateStr1, "YYYY-MM-DD hh:mm:ss");
      const momentDate2 = moment(dateStr2, "YYYY-MM-DD hh:mm:ss");
      if(momentDate1.isValid() && momentDate2.isValid())
      {
        return  momentDate1.diff(momentDate2, "seconds");
      }
      return Math.abs((newDate2.getTime() - newDate1.getTime())/1000);
    }
}