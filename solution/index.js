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

        addToLocalStorage(table, text)

    }
    else{ // In case the user adds empty task
        alert("Please Write Task to Add")
    }
    
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

function addToLocalStorage(table, task){
    // Gets table name (To DO, IN PROGRESS, DONE)
    // Adds the task to relevant location in local storage
    let oldTasks = JSON.parse(localStorage.getItem("tasks"))
    let newTasks = Object.assign({}, oldTasks) // Assigns the currently tasks to variable
    newTasks[table].unshift(task) // Adds the new task to the new variable 
    localStorage.removeItem("tasks") // Removes the old tasks from local storage
    localStorage.setItem("tasks", JSON.stringify(newTasks))

}

// Event Listeners
document.addEventListener("click", event => { // Uses one listener to all buttons in the page
    if (event.target.className === "add-task-button"){ // Handles add task button
      let tableEl = event.target.parentNode.parentNode // Finds the relevant button's clicked table
      let newTaskText = tableEl.getElementsByTagName("input")[0].value // Finds the new tasks's text
      addTask(tableEl, newTaskText)
    }
  })

window.addEventListener('load', saveAfterLoad) // Handles loading page