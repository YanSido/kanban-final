if (!localStorage.getItem("tasks")){ // Checks if there is key called "tasks" exist already, adds new if necessary
    let tasks = {
        "todo": [],
        "in-progress": [],
        "done": []
    }
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function addTask(tableElement, text){
    // Gets spesific table element, and task text
    // Returns the task element created <----------------------------------
    if (text){
        // Creating element for task
        let taskEl = document.createElement("li")
        let taskListEl = tableElement.getElementsByTagName("ul")[0]
        taskEl.setAttribute("class", "task")
        taskEl.setAttribute("style", "list-style-type:none") // Adds unordered list without bullets
        taskEl.innerText = text
        taskListEl.prepend(taskEl) // Inserts the task to the first place
        tableElement.getElementsByTagName("input")[0].value = "" // Display the placeholder after adding a task

        let table = findTableNameByElement(tableElement)

        updateLocalStorage(table, text)

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
    updateLocalStorage(tableName, editedTask, findTaskIndex(taskElement))
    taskElement.setAttribute("contenteditable", false) // disable the edit after unfocus
}

function moveTask(newTable, task){
    let taskIndex = findTaskIndex(task)
    let taskParentTableEl = findTableElementByName(task.parentNode.getAttribute("class"))
    task.remove() // Remove from current table DOM
    updateLocalStorage(findTableNameByElement(taskParentTableEl), "", taskIndex, true) // Remove from current table local storage
    let tableElement = findTableElementByName(newTable)
    addTask(tableElement, task.innerText)
}

function searchTask(){
    // Display tasks that their name contains given string
    let searchTaskString = document.getElementById("search") // Given string in search bar
    searchTaskString = searchTaskString.value.toUpperCase() // Does not metter if lower case or upper case
    if (searchTaskString !== ""){
        for (let task of document.getElementsByClassName("task")){
            if (!task.innerText.toUpperCase().includes(searchTaskString)){ // Checks every task if contains the given search
                task.style.display = "none"
            }
            else{
                task.style.display = "block"
            }
        }
    }
    else{
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

function saveAfterLoad(){
    // Saves DOM after reloading page based on local storage
    let tasks = JSON.parse(localStorage.getItem("tasks"))
    for (let table in tasks){
        for (let i = tasks[table].length-1; i>=0; i--){
            // Creating element for task
            let taskEl = document.createElement("li")
            let tableElement = findTableElementByName(table)
            let taskListEl = tableElement.getElementsByTagName("ul")[0]
            taskEl.setAttribute("class", "task")
            taskEl.setAttribute("style", "list-style-type:none") // Adds unordered list without bullets
            taskEl.innerText = tasks[table][i]
            taskListEl.prepend(taskEl) // Inserts the task to the first place
        }
    }
}

function updateLocalStorage(table, task, taskIndex, remove){
    // Gets table name (todo, in-progress, done), task, task index, remove indicator
    // Adds/edits the task in relevant location in local storage
    let oldTasks = JSON.parse(localStorage.getItem("tasks"))
    let newTasks = Object.assign({}, oldTasks) // Assigns the currently tasks to variable
    if (typeof(taskIndex) === "number"){ // Task index is given in case the user wants to edit task
        if (remove){ // If the function called to remove item from local storage
            newTasks[table].splice(taskIndex, 1)
        }
        else { // If the function called to rdit item from local storage
            newTasks[table][taskIndex] = task
        }
    }
    else { // In case the user wants to add task
        newTasks[table].unshift(task) // Adds the new task to the new variable 
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

// Event Listeners
document.addEventListener("click", event => { // Uses one listener to all click in the page
    if (event.target.className === "add-task-button"){ // Handles add task button
      let tableEl = event.target.parentNode.parentNode // Finds the relevant button's clicked table
      let newTaskText = tableEl.getElementsByTagName("input")[0].value // Finds the new tasks's text
      addTask(tableEl, newTaskText)
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

window.addEventListener('load', saveAfterLoad) // Handles loading page

