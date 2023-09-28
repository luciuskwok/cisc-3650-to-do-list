// main.js

// Whole-script strict mode
"use strict";

// Globals
var mainTasks = new Array();
var completedTasks = new Array();
var deletedTasks = new Array();
var selectedTasks = new Set();

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
}

// Frequently accessed elements
const mainTasksContainer = document.getElementById('main-tasks-container');
const mainTasksPlaceholder = document.getElementById('main-tasks-placeholder');
const completedTasksContainer = document.getElementById('completed-tasks-container');
const completedTasksPlaceholder = document.getElementById('completed-tasks-placeholder');
const newTaskDueDateField = document.getElementById('newTaskDueDateField');

// CSS constants
const normalTaskClassName = "row my-1 rounded bg-white";
const selectedTaskClassName = "row my-1 rounded bg-info"

// Clear all the input fields in the "New Task" modal
function clearNewTaskFields() {
	// Clear title
	document.getElementById('newTaskTitleField').value = "";
	// Reset due date to None
	document.getElementById('newTaskDueDateRadio1').checked = true;
	newTaskDueDateField.disabled = true;
	// Reset color selection (future)	
}

// Deselect all tasks
function deselect() {
	selectedTasks.clear();
}

// Update the background color of rows to indicate selection state
function updateRowSelectionState() {
	// Main tasks
	for (const row of mainTasksContainer.children) {
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

// Show "Edit Task" modal
function showEditTaskModal(task) {
	// TODO: implement this
}

// Create a <div> for the task, to be inserted into the DOM
function rowDivWithTask(task) {
	let rowIdentifier = "task_"+task.identifier;
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
	titleDiv.appendChild(document.createTextNode(task.title));
	rowDiv.appendChild(titleDiv);
	
	// Add event handler so that clicking on a row makes it selected
	titleDiv.addEventListener('click', (event) => {
		// Deselect
		// TODO: allow multiple selection with shift, ctrl, or command keys
		//if (event.shiftKey) ...
		deselect();

		// Select this element
		selectedTasks.add(task);

		// Visually indicate selection
		updateRowSelectionState();
	});
	
	// Add event handler for double-click to edit task
	titleDiv.addEventListener('dblclick', (event) => {
		showEditTaskModal(task);
	});
	
	// Add event handlers for when task is checked off, show an animation and 
	// move the task to the completed list if it was on the main list, or vice-versa.
	checkboxInput.addEventListener('click', (event) => {
		alert("checked off");
		// TODO: add code to implement this
	});
	
	return rowDiv;
}

function addNewTask(title, dueDate, color) {
	// Add task to top of list
	let task = new Task(title, dueDate, color);
	mainTasks.splice(0, 0, task);
	
	updateMainTaskList();
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

function updateMainTaskList() {
	// If there are no tasks in the main list, show the placeholder, otherwise show each task.
	// Note: this will result in a visible flicker if updating the entire list, so try not to use it when inserting or removing just one element.
	
	// Remove any non-placeholder rows from main tasks container
	removeNonPlaceholderRows(mainTasksContainer);
	
	if (mainTasks.length == 0) {
		mainTasksPlaceholder.hidden = false;
	} else {
		mainTasksPlaceholder.hidden = true;
		let index = 0;
		for (const task of mainTasks) {
			let rowDiv = rowDivWithTask(task, "task_"+index);
			mainTasksContainer.appendChild(rowDiv);
			index++;
		}
	}
}

function updateCompletedTaskList() {
	removeNonPlaceholderRows(completedTasksContainer);
	
	if (completedTasks.length == 0) {
		completedTasksPlaceholder.hidden = false;
	} else {
		completedTasksPlaceholder.hidden = true;
		let index = 0;
		for (const task of completedTasks) {
			let rowDiv = rowDivWithTask(task, "task_"+index);
			completedTasksContainer.appendChild(rowDiv);
			index++;
		}
	}
}
// ---- Main Script ----

// -- Add event listeners --

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
});

// New Task: Cancel button
document.getElementById('newTaskCancel').addEventListener('click', ({target}) => {
	// Clear all fields
	clearNewTaskFields();
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

// Main script

// Assignment says to "Add a list of tasks", so this adds a list of sample tasks.
mainTasks.push(new Task("Welcome to your to-do list!", null, null));
mainTasks.push(new Task("These are sample tasks to show you how this task list works", null, null));
mainTasks.push(new Task("Click on the checkbox next to a task to complete it", null, null));
mainTasks.push(new Task("Double click on the task to edit it", null, null));
mainTasks.push(new Task("Press \"New Task\" to add your own tasks", null, null));
updateMainTaskList();

