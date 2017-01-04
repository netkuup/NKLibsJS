# NKForm


NKForm.getFields()
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

**Params:**

NKForm.getFields( form_selector, json_output )

| param | Values | Mandatory | Description |
|:---|:---|:---|:---|
| form_selector | '#myForm', '.myForm', 'input[name=myForm]', etc. | Yes | The form id, class or name in JQuery format. |
| json_output | true, false | No | If true returns the outout in json format, if not as JS Object. |


**Config:**

| Variable | Default | Values | Description |
|:---|:---|:---|:---|
| NKForm.errors.duplicated_fields | true | true, false | Throw error if form have a duplicated input field name.

NKForm.setFields()
----------------------------------------------------------------------------
Initialize form fields.

JS

     var field_data = { 
        my_name: "Scott",  
        my_description: "Hello Scott",  
        my_eye_color: "brown"
     }
     
     NKForm.setFields( '#my_form', field_data );

**Params:**

NKForm.setFields( form_selector, form_data, json_output )

| param | Values | Mandatory | Description |
|:---|:---|:---|:---|
| form_selector | '#myForm', '.myForm', 'input[name=myForm]', etc. | Yes | The form id, class or name in JQuery format. |
| form_data | Object or JSON string | Yes | The form data to fill. 
| json_output | true, false | No | True if form_data is JSON, false if it's an Object. |


**Config:**

| Variable | Default | Values | Description |
|:---|:---|:---|:---|
| NKForm.errors.invalid_json | true | true, false | Throw error if json_output is true and form_data is not a valid json.


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
    NKForm.setFields('#my_form', sessionStorage.getItem('stored_fields'), true );

    function reloadPage() {
        // Store data to session storage.
        sessionStorage.setItem('stored_fields', NKForm.getFields('#my_form', true) );
        location.reload();
    }

Note: You can use localStorage, sessionStorage or NKStorage.

NKForm.fileChooser()
----------------------------------------------------------------------------
Opens a file chooser.

JS
    
    function showFile( filePath ) {
        console.log("Selected file path: ", filePath);
    }
    
    NKForm.fileChooser( showFile, ".gif,.jpg,.jpeg,.png,.doc,.docx" );

**Params:**

NKForm.fileChooser( callback, extension_list )

| param | Values | Mandatory | Description |
|:---|:---|:---|:---|
| callback | Function | Yes | Function called when a file is selected. |
| extension_list | String | No | The allowed file extensions. Example: ".gif,.jpg,.jpeg,.png,.doc,.docx"
