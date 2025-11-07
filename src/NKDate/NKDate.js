let NKDate = {};


NKDate.set = function( date_obj, dd = null, mm = null, yyyy = null, h = null, m = null, s = null, ms = null ) {
    date_obj.setTime( new Date( yyyy, mm-1, dd, h, m, s, ms ).getTime() );
    return date_obj;
};

NKDate.clone = function ( date_obj ) {
    return new Date(date_obj.getTime());
};

NKDate.setFromString = function( date_obj, str_date, date_pattern ) {

    let date_parts = str_date.split(/(?:\/|-| |:|\\)+/);
    let pattern_parts = date_pattern.split(/(?:\/|-| |:|\\)+/);

    if ( date_parts.length !== pattern_parts.length ) {
        throw "Date (" + str_date + ") does not fit the pattern (" + date_pattern + ")";
    }

    date_obj.setHours(0,0,0,0);
    for ( let i = 0; i < pattern_parts.length; i++ ) {
        switch ( pattern_parts[i] ) {
            case 'DD': NKDate.setDay(date_obj, date_parts[i]); break;
            case 'MM': NKDate.setMonth(date_obj, date_parts[i]); break;
            case 'YYYY': NKDate.setYear(date_obj, date_parts[i]); break;
            case 'YY': NKDate.setYear(date_obj, date_parts[i]); break;
            case 'hh': NKDate.setHour(date_obj, date_parts[i]); break;
            case 'mm': NKDate.setMinute(date_obj, date_parts[i]); break;
            case 'sss': NKDate.setMilisecond(date_obj, date_parts[i]); break;
            case 'ss': NKDate.setSecond(date_obj, date_parts[i]); break;
        }
    }

    return date_obj;
};

NKDate.getString = function( date_obj, format = 'DD/MM/YYYY' ) {
    let result = format;

    result = result.replaceAll('DD', NKDate.getDay(date_obj, true));
    result = result.replaceAll('MM', NKDate.getMonth(date_obj, true));
    result = result.replaceAll('YYYY', NKDate.getYear(date_obj, true));
    result = result.replaceAll('YY', NKDate.getYear(date_obj, false));
    result = result.replaceAll('hh', NKDate.getHour(date_obj, true));
    result = result.replaceAll('mm', NKDate.getMinute(date_obj, true));
    result = result.replaceAll('sss', NKDate.getMillisecond(date_obj, true));
    result = result.replaceAll('ss', NKDate.getSecond(date_obj, true));

    return result;
};

NKDate.getDay = function( date_obj, two_digits = true ) {
    let d = date_obj.getDate();
    if ( two_digits ) d = d.toString().padStart(2, "0");
    return d;
};

NKDate.setDay = function( date_obj, day ) {
    if ( day === null ) return;
    date_obj.setDate( day );
    return date_obj;
};

NKDate.getMonth = function( date_obj, two_digits = true ) {
    let m = date_obj.getMonth()+1;
    if ( two_digits ) m = m.toString().padStart(2, "0");
    return m;
};

NKDate.setMonth = function( date_obj, month ) {
    if ( month === null ) return;
    date_obj.setMonth( parseInt(month)-1 );
    return date_obj;
};

NKDate.getYear = function( date_obj, four_digits = true ) {
    if ( four_digits ) return date_obj.getFullYear();
    let y = date_obj.getYear();
    if ( y > 100 ) y -= 100;
    return y;
};

NKDate.setYear = function( date_obj, year ) {
    if ( year === null ) return;
    if ( parseInt(year) < 100) year = "20"+year;
    date_obj.setFullYear( year );
    return date_obj;
};

NKDate.getHour = function( date_obj, two_digits = true ) {
    let h = date_obj.getHours();
    if ( two_digits ) h = h.toString().padStart(2, "0");
    return h;
};

NKDate.setHour = function( date_obj, hour ) {
    if ( hour === null ) return;
    date_obj.setHours( hour );
    return date_obj;
};

NKDate.getMinute = function( date_obj, two_digits = true ) {
    let m = date_obj.getMinutes();
    if ( two_digits ) m = m.toString().padStart(2, "0");
    return m;
};

NKDate.setMinute = function( date_obj, minute ) {
    if ( minute === null ) return;
    date_obj.setMinutes( minute );
    return date_obj;
};

NKDate.getSecond = function( date_obj, two_digits = true ) {
    let s = date_obj.getSeconds();
    if ( two_digits ) s = s.toString().padStart(2, "0");
    return s;
};

NKDate.setSecond = function( date_obj, second ) {
    if ( second === null ) return;
    date_obj.setSeconds( second );
    return date_obj;
};

NKDate.getMillisecond = function( date_obj, three_digits = true ) {
    let ms = date_obj.getMilliseconds();
    if ( three_digits ) ms = ms.toString().padStart(3, "0");
    return ms;
};

NKDate.setMilisecond = function( date_obj, milisecond ) {
    if ( milisecond === null ) return;
    date_obj.setMilliseconds( milisecond );
    return date_obj;
};

NKDate.getUnixTimestamp = function ( date_obj ) {
    return date_obj.getTime();
};

NKDate.addMonths = function( date_obj, months ) {
    date_obj.setMonth(date_obj.getMonth() + months);
    return date_obj;
};

NKDate.addHours = function ( date_obj, hours ) {
    return NKDate.addMiliseconds(date_obj, (hours * 60) * 60000);
};

NKDate.addMinutes = function ( date_obj, minutes ) {
    return NKDate.addMiliseconds(date_obj, minutes * 60 * 1000);
};

NKDate.addSeconds = function ( date_obj, seconds ) {
    return NKDate.addMiliseconds(date_obj, seconds * 1000);
};

NKDate.addMiliseconds = function ( date_obj, miliseconds ) {
    date_obj.setTime( date_obj.getTime() + miliseconds );
    return date_obj;
};

NKDate.print = function ( date_obj ) {
    console.log( date_obj.toLocaleString() );
};

NKDate.equals = function ( date_1, date_2, compare_time = true ) {
    if ( compare_time ) return (date_1.getTime() === date_2.getTime());
    if ( date_1.getDate() !== date_2.getDate() ) return false;
    if ( date_1.getMonth() !== date_2.getMonth() ) return false;
    if ( date_1.getFullYear() !== date_2.getFullYear() ) return false;
    return true;
}

NKDate.daysInMonth = function( year, month ) {
    if ( month === 0 ) throw "Month 0 does not exist, January is month 1.";
    return 32 - new Date(year, month-1, 32).getDate();
};


// start_on_sunday = false; 0: Monday, 1: Tuesday, 2: Wednesday ...
// start_on_sunday = true;  0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday ...
NKDate.firstDayOfMonth = function ( year, month, start_on_sunday = false ) {
    if ( month === 0 ) throw "Month 0 does not exist, January is month 1.";
    let fd = new Date(year, month-1).getDay();
    if ( start_on_sunday ) return fd;
    return (fd === 0) ? 6 : fd-1;
};


NKDate.getDatesBetween = function ( date_start_obj, date_end_obj = null ) {
    if ( date_end_obj === null ) date_end_obj = date_start_obj;

    let dateArray = [];
    let currentDate = new Date(date_start_obj);

    while ( currentDate <= date_end_obj ) {
        dateArray.push( new Date( currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0,0,0,0 ) );
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
};



NKDate.getCalendar = function( year, month, add_empty_days = true, start_on_sunday = false) {
    let calendar = [];
    let today = new Date();
    let current_year_month = (year === today.getFullYear() && month === today.getMonth()+1);

    if ( add_empty_days ) {
        let firstDay = NKDate.firstDayOfMonth(year, month, start_on_sunday);
        for ( let i = 0; i < firstDay; i++ ) calendar.push({day: "", today: false, date: null});
    }

    let daysInMonth = NKDate.daysInMonth(year, month);
    for ( let i = 0; i < daysInMonth; i++ ) {
        calendar.push({day: i+1, today: (current_year_month && i+1 === today.getDate()), date: new Date(year, month-1, i+1)});
    }

    return calendar;
};

NKDate.setCalendarTasks = function ( calendar, tasks, cal_date_name, cal_tasklist_name, task_startdate_name, task_enddate_name ) {

    for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];
        let task_start = ( task[task_startdate_name] === "0000-00-00 00:00:00" ) ? null : new Date(task[task_startdate_name].replace(/-/g, "/")).getTime();
        let task_end = ( task[task_enddate_name] === "0000-00-00 00:00:00" ) ? null : new Date(task[task_enddate_name].replace(/-/g, "/")).getTime();

        for ( let c = 0; c < calendar.length; c++ ) {
            let cal = calendar[c];
            if ( cal[cal_date_name] === null ) continue;

            let day_start = cal[cal_date_name].getTime();
            let day_end = day_start + 86399999;

            if ( task_end === null ) {
                if (task_start >= day_start && task_start <= day_end) { //1day = 86400000ms
                    cal[cal_tasklist_name].push(NKObject.clone(task));
                }
            } if ( task_start === null ) {
                console.error("Task with date_end without date_start");
            } else {
                if ( task_end >= day_start && task_start <= day_end) {
                    cal[cal_tasklist_name].push(NKObject.clone(task));
                }
            }
        }
    }
};


//Node integration
if ( NK.node ) Object.assign(module.exports, { NKDate });