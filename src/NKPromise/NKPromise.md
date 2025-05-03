# NKPromise



## Examples
Convert async code to sync

    
    function wait5seconds() {
        let p = new NKPromise();
    
        setTimeout(function() {
    
            p.resolve("Hello world");
            //p.reject("Reject content");
    
        }, 5000);
    
        return p;
    }
    
    
    console.log("Waiting 5 seconds...");
    
    try {
        let result = await wait5seconds();
        console.log("Result:", result);

    } catch ( reject_content ) {
        console.error("Reject called.", reject_content);
        
    }
    


Output

    Waiting 5 seconds...
    Result: Hello world             // After 5 seconds
    
