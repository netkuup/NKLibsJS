# NKDate


NKDate.set( date_obj, dd, mm, yyyy, h, m, s, ms )
----------------------------------------------------------------------------

    let date_obj = new Date();
    
    NKDate.set( date_obj, 11, 2, 2033 );
    
    console.log( date_obj.toLocaleString() ); //Output: 11/2/2033, 0:00:00




NKDate.clone( date_obj )
----------------------------------------------------------------------------
    let date_obj_1 = new Date();
    let date_obj_2 = NKDate.clone( date_obj_1 );


NKDate.setFromString( date_obj, date_str, format_str )
----------------------------------------------------------------------------
    let date_obj = new Date();
    
    NKDate.setFromString( date_obj, "11/02/2033 22:23:24", "DD/MM/YYYY hh:mm:ss" );
    
    console.log( date_obj.toLocaleString() ); //Output: 11/2/2033, 22:23:24


NKDate.getString( date_obj, format_str )
----------------------------------------------------------------------------

    let date_obj = new Date();
    
    let date_str = NKDate.getString( date_obj, "DD/MM/YYYY hh:mm:ss" );
    
    console.log( date_str ); //Output: 24/01/2023 18:58:28

NKDate.getUnixTimestamp( date_obj )
----------------------------------------------------------------------------
    let date_obj = new Date();
    
    let unix_timestamp = NKDate.getUnixTimestamp( date_obj );
    
    console.log( unix_timestamp ); //Output: 1674583456939

Setters and getters
----------------------------------------------------------------------------
* NKDate.getDay( date_obj, two_digits = true )
* NKDate.setDay( date_obj, day )
* NKDate.getMonth( date_obj, two_digits = true )
* NKDate.setMonth( date_obj, month )
* NKDate.getYear( date_obj, four_digits = true )
* NKDate.setYear( date_obj, year )
* NKDate.getHour( date_obj, two_digits = true )
* NKDate.setHour( date_obj, hour )
* NKDate.getMinute( date_obj, two_digits = true )
* NKDate.setMinute( date_obj, minute ) {
* NKDate.getSecond( date_obj, two_digits = true )
* NKDate.setSecond( date_obj, second ) {
* NKDate.getMillisecond( date_obj, three_digits = true )
* NKDate.setMilisecond( date_obj, milisecond )

Add hours, minutes, seconds
----------------------------------------------------------------------------
* NKDate.addHours( date_obj, hours )
* NKDate.addMinutes( date_obj, minutes )
* NKDate.addSeconds( date_obj, seconds )
* NKDate.addMiliseconds( date_obj, miliseconds )


NKDate.getDatesBetween( date_start_obj, date_end_obj )
----------------------------------------------------------------------------
    let date_start = NKDate.set( new Date(), 21, 2, 2022 );
    let date_end = NKDate.set( new Date(), 24, 2, 2022 );
    
    let dates_between = NKDate.getDatesBetween( date_start, date_end );
    
    for ( let i = 0; i < dates_between.length; i++ ) {
        console.log( dates_between[i].toLocaleString() );
    }

    // Output:
    // 21/2/2022, 0:00:00
    // 22/2/2022, 0:00:00
    // 23/2/2022, 0:00:00
    // 24/2/2022, 0:00:00








