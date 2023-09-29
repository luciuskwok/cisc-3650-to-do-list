// main.js

// Whole-script strict mode
"use strict";

// Task class
class Task {
	static taskIdentifier = 1;
	constructor(title, dueDate, color) {
		this.title = title;
		this.dueDate = dueDate;
		this.color = color;
		this.checkedOff = false;
		this.identifier = Task.taskIdentifier;
		Task.taskIdentifier++;
	}
	
	// Create a <div> for the task, to be inserted into the DOM
	rowDiv() {
		let rowIdentifier = "task_"+this.identifier;
		// Add a new row for the task
		let rowDiv = document.createElement("div");
		rowDiv.className = normalTaskClassName;
		rowDiv.id = rowIdentifier+"_row";
		
		let checkboxDiv = document.createElement("div");
		checkboxDiv.className = "col-1 checkbox m-1 ";
		rowDiv.appendChild(checkboxDiv);
		
		let checkboxInput = document.createElement("input");
		checkboxInput.type = "checkbox";
		checkboxInput.id = rowIdentifier+"_checkbox";
		checkboxDiv.appendChild(checkboxInput);
		
		let titleDiv = document.createElement("div");
		titleDiv.className = "col m-0 py-1 user-select-none";
		titleDiv.id = rowIdentifier+"_title";
		titleDiv.appendChild(document.createTextNode(this.title));
		rowDiv.appendChild(titleDiv);
		
		// Add event handler so that clicking on a row makes it selected
		titleDiv.addEventListener('click', (event) => {
			// Deselect
			// TODO: allow multiple selection with shift, ctrl, or command keys
			//if (event.shiftKey) ...
			deselect();
	
			// Select this element
			selectedTasks.add(this);
	
			// Visually indicate selection
			updateSelection();
			
			// Prevent event propagation so that body event handler does not deselect rows.
			event.stopPropagation();
		});
		
		// Add event handler for double-click to edit task
		titleDiv.addEventListener('dblclick', (event) => {
			showEditTaskModal(this);
			
			// Prevent event propagation so that body event handler does not deselect rows.
			event.stopPropagation();
		});
		
		// Add event handlers for when task is checked off, show an animation and 
		// move the task to the completed list if it was on the main list, or vice-versa.
		checkboxInput.addEventListener('click', (event) => {
			console.log("Checkbox: "+event.target.checked);
			task.checkedOff = event.target.checked;
			
			// Allow body event handler to deselect rows.
		});
		
		return rowDiv;
	}

	// Delete a task from all lists
	deleteFromAllLists() {
		// Filter out task in each list
		mainTasks = mainTasks.filter(x => (x !== this));
		completedTasks = completedTasks.filter(x => (x !== this));
	}

}

// Globals
var mainTasks = new Array();
var completedTasks = new Array();
var deletedTasks = new Array();
var selectedTasks = new Set();
var taskBeingEdited = null;

// Frequently accessed elements
const mainTasksContainer = document.getElementById('main-tasks-container');
const completedTasksContainer = document.getElementById('completed-tasks-container');

// CSS constants
const normalTaskClassName = "row my-1 rounded bg-white";
const selectedTaskClassName = "row my-1 rounded bg-info"

/* ! - == Selection == */ 

// Deselect all tasks
function deselect() {
	selectedTasks.clear();
}

// Updates the selected state of all rows
function updateSelection() {
	updateSelectionWithContainer(mainTasksContainer);
	updateSelectionWithContainer(completedTasksContainer);
}

// Updates the background color of rows to indicate selection state
function updateSelectionWithContainer(container) {
	// Main tasks
	for (const row of container.children) {
		// Ignore placeholder rows
		if (!row.id.endsWith("placeholder")) {
			let selected = false;
			for (const task of selectedTasks) {
				//console.log("row.id == "+row.id+"; task.identifier == "+task.identifier);
				if (row.id === "task_"+task.identifier+"_row") {
					selected = true;
					break;
				}
			}
			if (selected) {
				row.className = selectedTaskClassName;
			} else {
				row.className = normalTaskClassName;
			}
		}
	}
}

/* !- == Updating Rows == */

function updateAllTaskLists() {
	updateMainTaskList();
	updateCompletedTaskList();
}

function updateMainTaskList() {
	// If there are no tasks in the main list, show the placeholder, otherwise show each task.
	// Note: this will result in a visible flicker if updating the entire list, so try not to use it when inserting or removing just one element.
	
	// Remove any non-placeholder rows from main tasks container
	removeNonPlaceholderRows(mainTasksContainer);
	
	const mainTasksPlaceholder = document.getElementById('main-tasks-placeholder');
	if (mainTasks.length == 0) {
		mainTasksPlaceholder.hidden = false;
	} else {
		mainTasksPlaceholder.hidden = true;
		let index = 0;
		for (const task of mainTasks) {
			mainTasksContainer.appendChild(task.rowDiv());
			index++;
		}
	}
}

function updateCompletedTaskList() {
	removeNonPlaceholderRows(completedTasksContainer);
	
	const completedTasksPlaceholder = document.getElementById('completed-tasks-placeholder');
	if (completedTasks.length == 0) {
		completedTasksPlaceholder.hidden = false;
	} else {
		completedTasksPlaceholder.hidden = true;
		let index = 0;
		for (const task of completedTasks) {
			completedTasksContainer.appendChild(task.rowDiv());
			index++;
		}
	}
}

function removeNonPlaceholderRows(container) {
	// Remove any non-placeholder rows from container
	let childrenToRemove = new Array();
	for (const child of container.children) {
		if (!child.id.endsWith("placeholder")) {
			childrenToRemove.push(child);
		}
	}
	for (const child of childrenToRemove) {
		container.removeChild(child);
	}
}

/* !- == New Task == */

const newTaskDueDateField = document.getElementById('newTaskDueDateField');

// Show "New Task" modal
function showNewTaskModal() {
	taskBeingEdited = null;
	
	// Create and show the modal
	let newModal = new bootstrap.Modal(document.getElementById('newTaskModal'));
	newModal.show();
}

function addNewTask(title, dueDate, color) {
	// Add task to top of list
	let task = new Task(title, dueDate, color);
	mainTasks.splice(0, 0, task);
	
	updateMainTaskList();
}

// Clear all the input fields in the "New Task" modal
function clearNewTaskFields() {
	// Clear title
	document.getElementById('newTaskTitleField').value = "";
	// Reset due date to None
	document.getElementById('newTaskDueDateRadio1').checked = true;
	newTaskDueDateField.disabled = true;
	// Reset color selection (future)	
}

/* ! New Task event listeners */

// New Task button that opens modal
document.getElementById('showNewTaskButton').addEventListener('click', ({target}) => {
	showNewTaskModal();
});

// New Task: Due Date radio group
document.getElementById('newTaskDueDateRadioGroup').addEventListener('click', ({target}) => {
	// Handler fires on root container click;
	// Enable or disable the date picker input based on which radio button
	// is selected.
	if (target.getAttribute('name') === 'dueDate') {
		if (target.value === 'none') {
			newTaskDueDateField.disabled = true;
		} else {
			newTaskDueDateField.disabled = false;
		}
	}

	// Prevent event propagation so that body event handler does not deselect rows.
	event.stopPropagation();
});

// New Task: Cancel button
document.getElementById('newTaskCancel').addEventListener('click', ({target}) => {
	clearNewTaskFields();

	// Prevent event propagation so that body event handler does not deselect rows.
	event.stopPropagation();
});

// New Task: OK button ("New Task")
document.getElementById('newTaskOK').addEventListener('click', ({target}) => {
	// Get title from newTaskTitleField
	let taskTitle = document.getElementById('newTaskTitleField').value;

	// TODO: Future: support due date and color

	// Add a new row for the task
	addNewTask(taskTitle);
	
	// Dismiss and clear modal
	bootstrap.Modal.getInstance(document.getElementById('newTaskModal')).hide();
	clearNewTaskFields();	
});

/* !- == Edit Task == */

// Show "Edit Task" modal
function showEditTaskModal(task) {
	taskBeingEdited = task;
	
	// Fill out form fields with data
	let titleField = document.getElementById('editTaskTitleField');
	titleField.value = task.title;
	
	// TODO: update the Due Date and Color in Edit Task modal
	
	// Create and show the modal
	let editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
	editModal.show();
}

// Delete selected tasks
function deleteSelectedTasks() {
	for (const task of selectedTasks) {
		task.deleteFromAllLists();
	}
	deselect();
	updateMainTaskList();
	updateCompletedTaskList();
}

// Edit Task: Delete button
document.getElementById('editTaskDelete').addEventListener('click', ({target}) => {
	taskBeingEdited.deleteFromAllLists();
	taskBeingEdited = null;
	
	updateAllTaskLists();
	// Allow event propagation so that body event handler deselects rows.
});

// Edit Task: Cancel button
document.getElementById('editTaskCancel').addEventListener('click', ({target}) => {
	// Prevent event propagation so that body event handler does not deselect rows.
	event.stopPropagation();
});

// Edit Task: OK button
document.getElementById('editTaskOK').addEventListener('click', ({target}) => {
	// Update task with edited title
	taskBeingEdited.title = document.getElementById('editTaskTitleField').value;

	// TODO: Future: support due date and color

	// Deselect and update
	updateAllTaskLists();
	
	// Dismiss modal
	bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
});

/* !- Body event listeners */
// Add click event listener so that clicks here deselect rows
document.addEventListener('click', event => {
	if (!modalIsOpen()) {
		deselect();
		updateSelection();
	}
});

// Add keydown event listener for key shortcuts
document.addEventListener('keydown', event => {
	if (!modalIsOpen()) {
		switch (event.key) {
			case "Delete": case "Backspace":
				//console.log("Delete Task");
				deleteSelectedTasks();				
				break;
			case "N": case "n":
				//console.log("New Task");
				showNewTaskModal();
				break;
			case "Return": case "Enter":
				// TODO: show Edit Task dialog if a task is selected
				console.log("Edit Task");
				break;
		}
	}
});

function modalIsOpen() {
	return isElementVisible('editTaskModal') || isElementVisible('newTaskModal');
}

function isElementVisible(elementId) {
	let display = document.getElementById(elementId).style.display;
	return display != null && display !== "" &&display !== "none";
}

/* !- Main script */

// Assignment says to "Add a list of tasks", so this adds a list of sample tasks.
mainTasks.push(new Task("Welcome to your to-do list!", null, null));
mainTasks.push(new Task("These are sample tasks to show you how this task list works", null, null));
mainTasks.push(new Task("Click on the checkbox next to a task to complete it", null, null));
mainTasks.push(new Task("Double click on the task to edit it", null, null));
mainTasks.push(new Task("Press \"New Task\" to add your own tasks", null, null));
updateMainTaskList();

