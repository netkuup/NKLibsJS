let NKDebounce = {
    timeoutId: {}
};


NKDebounce.callOnce = function ( func, ms = 200 ) {
    let call_line = NKDebounce.getCallLine();

    clearTimeout( NKDebounce.timeoutId[call_line] );

    NKDebounce.timeoutId[call_line] = setTimeout(() => {
        func();
    }, ms);

}

NKDebounce.getCallLine = function () {
    const stack = new Error().stack;
    const match = stack.match(/\(([^)]+)\)/);
    let call_line = match ? match[1] : null;

    if ( call_line === null ) {
        console.error("NKDebounce error.");
        return "";
    }

    call_line = call_line.split("/");
    return call_line[call_line.length - 1];
}
