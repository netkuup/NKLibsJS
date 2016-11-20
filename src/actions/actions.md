# NKActions
A set of helpers for basic user actions.

Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKActions.start();

NKHide
----------------------------------------------------------------------------
When click on element with '.NKHide_btn', the first parent with '.NKHide_dst' will be hidden.

    <div class="NKHide_dst NKBStick">
        This site uses cookies. <a class="NKHide_btn NKLink">Close</a>
    </div>


NKDel
----------------------------------------------------------------------------
When click on element with '.NKDel_btn', the first parent with '.NKDel_dst' will be deleted.

    <div class="NKDel_dst NKBStick">
        This site uses cookies. <a class="NKDel_btn NKLink">Close</a>
    </div>
    
NKTemplate
----------------------------------------------------------------------------
* When click '<i>.NKTemplate_btn.T1</i>' the element '<i>.NKTemplate_src.T1</i>' will be copied and appended to '<i>.NKTemplate_dst.T1</i>'
* The next class of '<i>NKTemplate_</i>', in this case '<i>T1</i>' is a template name of your choice.

Example 1:

    <div id="element" class="NKTemplate_src T1">
        Potatoes<br>
    </div>
    
    <div id="element_list" class="NKTemplate_dst T1"></div>

    <a class="NKTemplate_btn T1">Add potatoes to list</a>

Example 2:

    <div id="element" class="NKTemplate_src list1 list2">
        Potatoes<br>
    </div>
    
    <div id="element_list_a" class="NKTemplate_dst list1"></div>
    <div id="element_list_b" class="NKTemplate_dst list2"></div>

    <a class="NKTemplate_btn list1">Add element to list 1</a>
    <a class="NKTemplate_btn list2">Add element to list 2</a>
    
Note: 'NKTemplate_btn [template_name]' only can contain one template name.