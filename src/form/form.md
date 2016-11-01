# NKForm


getFields( form_selector )
----------------------------------------------------------------------------
List all form inputs and their values.


**Example:**

HTML
    
    <script src="http://code.jquery.com/jquery-3.1.1.min.js"></script>
    <script type="text/javascript" src="../base/base.js" ></script>
    <script type="text/javascript" src="./form.js" ></script>
    
    <form id="my_form">
        Name: <input type="text" name="my_name" value="Scott"><br>
        Description: <textarea name="my_description" >Hello Scott</textarea><br>
        Eye color:
        <select name="my_eye_color">
            <option value="brown">Brown</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
        </select>
    </form>

JS

    console.log( NKForm.getFields('#my_form') );
    

**Output:**

     Object { 
        my_name="Scott",  
        my_description="Hello Scott",  
        my_eye_color="brown"
     }
     
**Config:**

| Variable | Default | Values | Description |
|:---|:---|:---|:---|
| NKForm.errors.duplicated_fields | true | true, false | Throw error if form have a duplicated input field name.

setFields( form_selector, fields_data )
----------------------------------------------------------------------------
Initialize form fields.

JS

     var field_data = { 
        my_name: "Scott",  
        my_description: "Hello Scott",  
        my_eye_color: "brown"
     }
     
     NKForm.setFields( '#my_form', field_data );
     
     
Preserve fields after page reload.
----------------------------------------------------------------------------
HTML

    <script src="http://code.jquery.com/jquery-3.1.1.min.js"></script>
    <script type="text/javascript" src="../../base/base.js" ></script>
    <script type="text/javascript" src="../form.js" ></script>
    
    <form id="my_form">
        Name: <input type="text" name="my_name" value="Scott"><br>
        Description: <textarea name="my_description" >Hello Scott</textarea><br>
        Eye color:
        <select name="my_eye_color">
            <option value="brown">Brown</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
        </select>
    </form>
    
    <input type="button" onclick="reloadPage()" value="Reload page">


JS

    // Get the field data from session storage.
    NKForm.setFields('#my_form', sessionStorage.getItem('stored_fields') );

    function reloadPage() {
        // Store data to session storage.
        sessionStorage.setItem('stored_fields', NKForm.getFields('#my_form') );
        location.reload();
    }

Note: You can use localStorage instead of sessionStorage