if (!localStorage.getItem("tasks")){ // Checks if there is key called "tasks" exist already, adds new if necessary
    let tasks = {
        "todo": [],
        "in-progress": [],
        "done": []
    }
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

async function sendLoadRequest(){
    // Sends HTTP GET request
    // Returns the data in API

    let loaderEl = document.createElement("div")
    loaderEl.setAttribute("class", "loader")
    document.getElementsByTagName("body")[0].appendChild(loaderEl)

    const response = await fetch("https://json-bins.herokuapp.com/bin/614c589018fa9b97f9f6adba", { // Sending http GET request
        method: "GET",
        header: {
            "Content-Type": "application/json"
        },
   
    })

    document.getElementsByClassName("loader")[0].remove() // Removes loader after receiving response

    if (!response.ok){ // If there is an error, alerts the error
        alert(response.statusText)
        throw Error(response.statusText)
    }

    return response
}

async function sendSaveRequest() { 
    let tasks = JSON.parse(localStorage.getItem("tasks")) // Saves local storage to a variable

    // Creating loader when sending request
    let loaderEl = document.createElement("div")
    loaderEl.setAttribute("class", "loader")
    document.getElementsByTagName("body")[0].appendChild(loaderEl)

    const response = await fetch("https://json-bins.herokuapp.com/bin/614c589018fa9b97f9f6adba" , {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({tasks}) 
    })

    document.getElementsByClassName("loader")[0].remove() // Removes loader after receiving response


    if (!response.ok) { // If there is an error, alerts the error
        alert(response.statusText)
        throw Error(response.statusText)
    }

}

async function handleAnswer(requestType){
    // Gets a request type
    // Returns the tasks from APi or Update the tasks in the API
    if (requestType === "load"){
        const jsonResponse = await (await sendLoadRequest()).json() // Convert to JSON format

        let apiData = jsonResponse.tasks // API data
        let localStorageData = JSON.parse(localStorage.getItem("tasks")) // Local storage data

        if (JSON.stringify(apiData) !== JSON.stringify(localStorageData)){ // In case the data loaded from API different from the data in local storage
            localStorage.setItem("tasks" , JSON.stringify(apiData)) // Update the local storage from API

            // Updates DOM
            clearDom()
            saveDomAfterLoad()
        }    
    }

    if (requestType === "save"){
        sendSaveRequest()
    }
    
}

function addTask(tableElement, text){
    // Gets spesific table element, and task text
    // Adds the task to DOM and local storage
    if (text){
        // Creating element for task
        let taskEl = document.createElement("li")
        let taskListEl = tableElement.getElementsByTagName("ul")[0]
        taskEl.setAttribute("class", "task")
        taskEl.setAttribute("draggable", "true") // Allows to drag the element
        taskEl.innerText = text

        taskListEl.prepend(taskEl) // Inserts the task to the first place
        
        tableElement.getElementsByTagName("input")[0].value = "" // Display the placeholder after adding a task

        updateLocalStorage(findTableNameByElement(tableElement), text) // Updates the local storage

    }
    else{ // In case the user adds empty task
        alert("Please Write Task to Add")
    } 
}

function editTask(taskElement){
    // Gets task element
    // Edits the content of the task given
    let editedTask = taskElement.innerText
    let tableElement = findTableElementByName(taskElement.parentNode.getAttribute("class"))
    let tableName = findTableNameByElement(tableElement)

    updateLocalStorage(tableName, editedTask, findTaskIndex(taskElement)) // Updates the local storage

    taskElement.setAttribute("contenteditable", false) // disable the edit after unfocus
}

function moveTask(newTable, task){
    // Gets new table and task
    // Adds to table the task
    let taskIndex = findTaskIndex(task)
    let taskParentTableEl = findTableElementByName(task.parentNode.getAttribute("class"))

    task.remove() // Remove from current table DOM

    updateLocalStorage(findTableNameByElement(taskParentTableEl), "", taskIndex, true) // Remove from current table local storage

    addTask(findTableElementByName(newTable), task.innerText)
}

function searchTask(){
    // Display tasks that their name contains given string
    let searchTaskString = document.getElementById("search") // Given string in search bar

    searchTaskString = searchTaskString.value.toUpperCase() // Does not metter if lower case or upper case

    if (searchTaskString !== ""){
        for (let task of document.getElementsByClassName("task")){
            if (!task.innerText.toUpperCase().includes(searchTaskString)){ // Checks every task if contains the given search
                task.style.display = "none" // Hides the not relevant tasks
            }
            else{
                task.style.display = "block" // Shows the relevant tasks
            }
        }
    }
    else{ // Incase search bar is empty, shows all the task as default
        for (let task of document.getElementsByClassName("task")){
            task.style.display = "block"   
        }
    }
}

function findTableNameByElement(tableElement){
    // Gets table Element
    // Returns the name of the table
    let table
    if (tableElement.id === "to-do-tasks-section"){
        table = "todo"
    }
    if (tableElement.id === "in-progress-tasks-section"){
        table = "in-progress"
    }
    if (tableElement.id === "done-tasks-section"){
        table = "done"
    }
    return table
}

function findTableElementByName(table){
    // Gets table name ("todo", "in-progress", "done")
    // Returns the section element of given table name
    if (table.includes("todo") || table.includes("to-do")){
        return document.getElementById("to-do-tasks-section")
    }
    if (table.includes("in-progress")){
        return document.getElementById("in-progress-tasks-section")
    }
    if (table.includes("done")){
        return document.getElementById("done-tasks-section")
    }
}

function saveDomAfterLoad(){
    // Saves DOM after reloading page based on local storage
    let tasks = JSON.parse(localStorage.getItem("tasks"))
    for (let table in tasks){
        for (let i = tasks[table].length-1; i>=0; i--){
            // Creating element for task
            let taskEl = document.createElement("li")
            let tableElement = findTableElementByName(table)
            let taskListEl = tableElement.getElementsByTagName("ul")[0]

            taskEl.setAttribute("class", "task")
            taskEl.setAttribute("draggable", "true") // Allows to drag the element
            taskEl.innerText = tasks[table][i]

            taskListEl.prepend(taskEl) // Inserts the task to the first place
        }
    }
}

function updateLocalStorage(table, task, taskIndex, remove, moved){
    // Gets table name (todo, in-progress, done), task, task index, remove indicator, move indicator
    // Adds/edits/removes the task in relevant location in local storage
    let oldTasks = JSON.parse(localStorage.getItem("tasks"))
    let newTasks = Object.assign({}, oldTasks) // Assigns the currently tasks to variable

    if (typeof(taskIndex) === "number"){ // Task index is given in case the user wants to edit task
        if (remove){ // If the function called to remove item from local storage
            newTasks[table].splice(taskIndex, 1)
        }
        else if (!remove && !moved) { // If the function called to edit item from local storage
            newTasks[table][taskIndex] = task
        }
    
        if(moved){ // Adds to specific location in table
            newTasks[table].splice(taskIndex,0,task)
        }
    }
    else { // In case the user wants to add task
        newTasks[table].unshift(task) // Adds the new task to the first place 
    }

    localStorage.removeItem("tasks") // Removes the old tasks from local storage
    localStorage.setItem("tasks", JSON.stringify(newTasks))
}

function findTaskIndex(taskElement){
    // Gets task element
    // Returns the index of the task in the table
    let i = 0
    while ((taskElement =  taskElement.previousSibling) != null){
        i++
    }
    return i;
}

function clearDom(){
    // Clears the DOM
    let ulElements = [document.getElementsByClassName("to-do-tasks")[0] , document.getElementsByClassName("in-progress-tasks")[0] , document.getElementsByClassName("done-tasks")[0]]
    
    for (let ulElement of ulElements){
        ulElement.innerHTML = ""
    }
}

// Event Listeners
document.addEventListener("click", event => { // Uses one listener to all click in the page
    if (event.target.className === "add-task-button"){ // Handles add task buttons
        let tableEl = event.target.parentNode.parentNode // Finds the relevant button's clicked table
        let newTaskText = tableEl.getElementsByTagName("input")[0].value // Finds the new tasks's text
        addTask(tableEl, newTaskText)
    }

    if (event.target.className === "api-button"){ // Handles API buttons
        if (event.target.id === "save-btn"){
            handleAnswer("save")
        }
        if (event.target.id === "load-btn"){
            handleAnswer("load")
        }
    }
  })

document.addEventListener("dblclick", event => { // Handles double click events
    if (event.target.className === "task"){
        event.target.setAttribute("contenteditable", true) // Enable the edit
        event.target.addEventListener("blur", () => {editTask(event.target)}) 
    }
    
})

let mousePositionElement // Get live element mouse position
document.addEventListener("mouseover", event =>{ // Handles hover events
    mousePositionElement = event.target
})

document.addEventListener("keydown", event =>{ // Handles keyboard press events
    if (event.altKey === true && (event.key === "1" || event.key === "2" || event.key === "3")){ // Checks if Alt + 1/2/3 is pressed
        if (mousePositionElement.className === "task"){ // Checks if pressed on the task
            let table
            if (event.key === "1"){
                table = "todo"
            }
            if (event.key === "2"){
                table = "in-progress"
            }
            if (event.key === "3"){
                table = "done"
            }
            moveTask(table, mousePositionElement)
        }
    }
})

document.getElementById("search").addEventListener("keyup", searchTask) // Handles keyboard press release

window.addEventListener('load', saveDomAfterLoad) // Handles loading page

// Drag & Drop Handle
let draggableTask = null // Current dragged task element
let originalDraggableTaskTable = null // Current dragged task's table element before drag
let originalDraggableTaskIndex = null // Current dragged task's index in list before drag

document.addEventListener("dragstart", event =>{ // Handles starting drag
    if (event.target.className === "task"){ // To enable only on task elemets
        draggableTask = event.target
        setTimeout(() =>{ 
            event.target.style.display = "none" // To hide the selected task
        }, 0)

        originalDraggableTaskTable = event.target.parentNode.parentNode.cloneNode(true)
        originalDraggableTaskIndex = findTaskIndex(draggableTask)

    }
})

document.addEventListener("dragend", event =>{ // Handles the end of the drag
    if (event.target.className === "task"){ 
        draggableTask = null
        setTimeout(() =>{
            event.target.style.display = "block" // To show the selected task
        }, 0)
    }
})

document.addEventListener("dragover", event =>{ // Handles the over dragged elements
    if (event.target.tagName === "SECTION"){ // To enable only on table elemets
        event.preventDefault() // Fix no display problem
    }
    if (event.target.tagName === "LI"){ 
        event.preventDefault() // Fix no display problem
    }
})

document.addEventListener("dragenter", event =>{ // Handles the enter of the current dragged into relevant elements
    // border effect if enter to relevant elements
    if (event.target.tagName === "SECTION"){ 
        event.target.style.border = "4px solid #9af9c5"
    }
    if (event.target.tagName === "LI"){ 
        event.target.style.borderBottom = "6px solid #9af9c5"
    }
})

document.addEventListener("dragleave", event =>{ // Handles the exit of the current dragged from relevant elements
    // border effect if exits from relevant elements
    if (event.target.tagName === "SECTION"){
        event.target.style.border = "4px solid #ce9171"
    }
    if (event.target.tagName === "LI"){
        event.target.style.borderBottom = "none"
    }
})

document.addEventListener("drop", event =>{ // Handles when the user drops the element
    if (event.target.tagName === "SECTION" && originalDraggableTaskTable.id !== event.target.id){ // To enable only on section and if not in the same element as at the beginning
        event.target.style.border = "4px solid #ce9171"
        addTask(event.target, draggableTask.innerText) // Adds the task to the top of the table
        updateLocalStorage(findTableNameByElement(originalDraggableTaskTable), draggableTask.innerText, originalDraggableTaskIndex, true) // Remove from previous table in local storage

        let originalElement = document.getElementById(originalDraggableTaskTable.id).querySelectorAll(".task")[originalDraggableTaskIndex] // Finds the task element before dragging

        originalElement.remove() // Remove from previous table in DOM
    }

    if (event.target.tagName === "LI" && originalDraggableTaskTable.id !== event.target.parentNode.parentNode.id){ // To enable only on section and if not in the same element as at the beginning
        event.target.style.borderBottom = "none"

        updateLocalStorage(findTableNameByElement(event.target.parentNode.parentNode), draggableTask.innerText, findTaskIndex(event.target) + 1, "" ,true) // Adds the task below the element that dropped on
        updateLocalStorage(findTableNameByElement(originalDraggableTaskTable), draggableTask.innerText, originalDraggableTaskIndex, true) // Remove from previous table in local storage

        event.target.parentNode.insertBefore(draggableTask, event.target.nextSibling) // Adds the task to the new DOM

    }
    
})