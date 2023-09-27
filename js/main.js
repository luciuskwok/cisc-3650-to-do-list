// main.js

// Whole-script strict mode
"use strict";

// Globals
var mainTasks = new Array();
var completedTasks = new Array();
var deletedTasks = new Array();

// Task class
class Task {
	constructor(title, dueDate, color) {
		this.title = title;
		this.dueDate = dueDate;
		this.color = color;
		this.checkedOff = false;
	}
}

// Frequently accessed elements
const mainTasksContainer = document.getElementById('main-tasks-container');
const mainTasksPlaceholder = document.getElementById('main-tasks-placeholder');
const completedTasksContainer = document.getElementById('completed-tasks-container');
const completedTasksPlaceholder = document.getElementById('completed-tasks-placeholder');
const newTaskDueDateField = document.getElementById('newTaskDueDateField');

// Clear all the input fields in the "New Task" modal
function clearNewTaskFields() {
	// Clear title
	document.getElementById('newTaskTitleField').value = "";
	// Reset due date to None
	document.getElementById('newTaskDueDateRadio1').checked = true;
	newTaskDueDateField.disabled = true;
	// Reset color selection (future)	
}

// Create a <div> for the task, to be inserted into the DOM
function rowDivWithTask(task, taskIdentifier) {
	// Add a new row for the task
	let rowDiv = document.createElement("div");
	rowDiv.className = "row bg-white m-1";
	rowDiv.id = taskIdentifier+"_row";
	
	let checkboxDiv = document.createElement("div");
	checkboxDiv.className = "col-1 checkbox m-1 ";
	rowDiv.appendChild(checkboxDiv);
	
	let checkboxInput = document.createElement("input");
	checkboxInput.type = "checkbox";
	rowDiv.id = taskIdentifier+"_checkbox";
	checkboxDiv.appendChild(checkboxInput);
	
	let titleDiv = document.createElement("div");
	titleDiv.className = "col m-0";
	titleDiv.id = taskIdentifier+"_title";
	titleDiv.appendChild(document.createTextNode(task.title));
	rowDiv.appendChild(titleDiv);
	
	return rowDiv;
}

function addNewTask(title, dueDate, color) {
	// Add task to top of list
	let task = new Task(title, dueDate, color);
	mainTasks.splice(0, 0, task);
	
	updateMainTaskList();
	
	// let rowDiv = rowDivWithTask(task, "task_n");
	// mainTasksContainer.appendChild(rowDiv);
	
	// Hide placeholder
	mainTasksPlaceholder.hidden = true;
}

function updateMainTaskList() {
	// If there are no tasks in the main list, show the placeholder, otherwise show each task.
	// Note: this will result in a visible flicker if updating the entire list, so try not to use it when inserting or removing just one element.
	
	// Remove any non-placeholder rows from main tasks container
	let childrenToRemove = new Array();
	for (const child of mainTasksContainer.children) {
		if (!child.id.endsWith("placeholder")) {
			childrenToRemove.push(child);
		}
	}
	for (const child of childrenToRemove) {
		mainTasksContainer.removeChild(child);
	}
	
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

// Testing: add some elements
mainTasks.push(new Task("Test task 1", null, null));
mainTasks.push(new Task("Test task 2 with a longer name", null, null));
mainTasks.push(new Task("Test task 3", null, null));
updateMainTaskList();

mainTasks.push(new Task("4th task for testing update", null, null));
updateMainTaskList();
