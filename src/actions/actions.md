# NKActions
A set of helpers for basic user actions.

Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKActions.start();

If the HTML document content changes dinamically (Creates new NKActions elements via Javascript, etc.) you must set 'reactable = true' so that the library will automatically detect the changes and work with the new content.

    NKActions.start(true);

NKHide
----------------------------------------------------------------------------
When click on element with '.NKHide_btn', the first parent with '.NKHide_dst' will be hidden.

    <div class="NKHide_dst NKStickBO">
        This site uses cookies. <a class="NKHide_btn NKLink">Close</a>
    </div>


NKDel
----------------------------------------------------------------------------
When click on element with '.NKDel_btn', the first parent with '.NKDel_dst' will be deleted.

    <div class="NKDel_dst NKStickBO">
        This site uses cookies. <a class="NKDel_btn NKLink">Close</a>
    </div>

NKToggle
----------------------------------------------------------------------------
When click on element with '.NKToggle_btn', the nearest element with '.NKToggle_dst' will be toggled.

    <div>
        <div class="NKToggle_dst">
            Hello world.
        </div>
        <a class="NKToggle_btn NKLink">Toggle</a>
    </div>

If we use '.NKReact' after 'NKToggle_btn', the text 'Foo' will be automatically changed to 'Show' or 'Hide'.

    <div>
        <div class="NKToggle_dst">
            Hello world.
        </div>
        <a class="NKToggle_btn NKReact NKLink">Foo</a>
    </div>


NKTemplate
----------------------------------------------------------------------------
* __Note:__ This method will be deprecated or improved in the near future. I do not recommend using it.
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

[<< Index](../../../../)