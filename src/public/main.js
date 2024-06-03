import { io } from './socket.io/socket.io.esm.min.js';

function main() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', login);
    const registerPageLink = document.getElementById('register-page-link');
    registerPageLink.addEventListener('click', switchToRegister);
    const loginPageLink = document.getElementById('login-page-link');
    loginPageLink.addEventListener('click', switchToLogin);
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    document.getElementById('register-form').addEventListener('submit', register);
    const taskForm = document.getElementById('taskForm');
    const removeBtn = document.getElementById('remove-btn');
    const showAddTaskFormBtn = document.getElementById('show-add-task-form-btn');
    const showTasksBtn = document.getElementById('show-tasks-btn');
    const showSearchTasksFormBtn = document.getElementById('show-search-tasks-form-btn');
    const showSettingsFormBtn = document.getElementById('show-settings-form-btn')
    


    document.getElementById('search-taskName').addEventListener('input', event => {
        const taskName = event.target.value;
        filterTasks(taskName);
    });
    saveSettingsBtn.addEventListener('click', saveSettings);
    showSearchTasksFormBtn.addEventListener('click', showSearchTasksForm);
    removeBtn.addEventListener('click', removeTasks);
    taskForm.addEventListener('submit', addTask);
    showAddTaskFormBtn.addEventListener('click', showAddTaskForm);
    showTasksBtn.addEventListener("click", showTasks);
    showSettingsFormBtn.addEventListener("click", showSettings);
    const socket = io();
    socket.on('newTask', (task) => {
       addTaskElement(task);
    }); 
    
}

async function getTasks(){
    const res = await fetch('/tasks');
    if (!res.ok) {
        throw new Error('Failed to fetch tasks');
    }
    const tasks = await res.json();
    tasks.forEach(task=>{
        addTaskElement(task);
    });
}

function filterTasks(taskName) {
    const tasks = document.querySelectorAll('.list-group-item');
    tasks.forEach(task => {
        const taskNameElement = task.querySelector('label');
        const taskNameText = taskNameElement.textContent.toLowerCase();
        if (taskNameText.includes(taskName.toLowerCase())) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}

async function removeTasks(){
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);
    const selectedIds = selectedCheckboxes.map(checkbox =>checkbox.id.slice(9));
    const tasks = {
        tasks: selectedIds
    }

    const options = {
        "method" : "POST",
        "headers" : {
            "Content-Type" : "application/json"
        },
        "body" : JSON.stringify(tasks)
    }

    try {
        const res = await fetch('/tasks/remove/selected', options);
        if (!res.ok) {
            throw new Error('Failed to remove tasks');
        }
        const session = document.getElementById('tasks');
        // Remove the selected tasks from the screen
        selectedIds.forEach(id => {
            const listItem = document.getElementById(`listItem-${id}`);
            session.removeChild(listItem);
        });

    } catch (error) {
        console.error('Error removing tasks:', error);
    }

}

function showAddTaskForm() {
    const form = document.getElementById('taskForm');
    form.style.display = "block";
    const tasks = document.getElementById('allTasks');
    tasks.style.display = 'block';
    hideSearchTasksForm();
    hideSettingsForm();
}

function showTasks(){
    const tasks = document.getElementById('allTasks');
    tasks.style.display = 'block';
    hideAddTaskForm();
    hideSearchTasksForm();
    hideSettingsForm();
}

function showSettings(){
    const form = document.getElementById('settingsForm');
    form.style.display = 'block';
    hideAddTaskForm();
    hideSearchTasksForm();
    hideTasks();
}


function hideTasks(){
    const tasks = document.getElementById('allTasks');
    tasks.style.display = 'none';
}


function hideSettingsForm(){
    const form = document.getElementById('settingsForm');
    form.style.display = 'none';
}
function hideAddTaskForm() {
    const form = document.getElementById('taskForm');
    form.style.display = "none";
}

function showSearchTasksForm(){
    const form = document.getElementById('searchForm');
    form.style.display = "block";
    const tasks = document.getElementById('allTasks');
    tasks.style.display = 'block';
    hideAddTaskForm();
    hideSettingsForm();
}

function hideSearchTasksForm(){
    const form = document.getElementById('searchForm');
    form.style.display = "none";
}

function addTaskElement(task) {
    
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    listItem.id = `listItem-${task._id}`; 

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input me-1';
    checkbox.id = `checkbox-${task._id}`; 

    const label = document.createElement('label');
    label.textContent = task.name;
    label.className = 'text-light';
    label.setAttribute('for', `checkbox-${task._id}`);

    listItem.appendChild(checkbox);
    listItem.appendChild(label);

    listItem.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
    });

    const session = document.getElementById('tasks');
    session.appendChild(listItem);

}

async function addTask(event){
    event.preventDefault();
    const name = document.getElementById('taskName').value;
    const date = document.getElementById('deadlineDate').value;
    const time = document.getElementById('deadlineTime').value;
    const deadline = `${date}T${time}`;
    const task = {name, deadline};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(task)
    }
    const res = await fetch('/tasks/add', options);

}

async function login(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const credentials = { username, password };

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('task-content').style.display = 'flex';
            document.getElementById('login-form').style.display = 'none';
            let userId = document.createElement('div');
            userId.id = 'userId';
            userId.textContent = ''+data.user._id;
            document.body.appendChild(userId);
            getTasks();
        } else {
            const errorMessage = document.getElementById('login-error-message');
            errorMessage.textContent = data.error;
            errorMessage.style.display = 'block';
            console.error(data.error);
        }
    } catch (error) {
        console.error('An error occurred during login:', error);
    }
}

async function register(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const credentials = { username: username, password:password };

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (response.ok) {
            const errorMessage = document.getElementById('register-error-message');
            errorMessage.textContent = data.data;
            errorMessage.style.color = 'green';
            errorMessage.style.display = 'block';
            console.log('Registration successful');
        } else {
            const errorMessage = document.getElementById('register-error-message');
            errorMessage.textContent = data.error;
            errorMessage.style.display = 'block';
            console.error(data.error);
        }
    } catch (error) {
        console.error('An error occurred during registration:', error);
    }
}

function switchToRegister(){
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function switchToLogin(){
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function saveSettings(event){
    event.preventDefault();
    const newUsername = document.getElementById('username').value;
    const newPassword = document.getElementById('password').value;
    const oldPassword = document.getElementById('oldPassword').value;
    const data = {
        darkMode: darkMode,
        newUsername: newUsername,
        newPassword: newPassword,
        oldPassword: oldPassword
    };

    if (oldPassword === undefined || oldPassword.trim() === "") {
        alert("Old password is required");
        return; 
    }

    if(newUsername!=undefined && newUsername!="")
    {
        fetch('auth/change-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update username');
            }
            alert("username updated");
            console.log('Username updated successfully');
        })
        .catch(error => {
            console.error('Error updating username:', error);
        });
    }

    if(newPassword!=undefined && newPassword!="")
    {
        fetch('auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update password');
            }
            alert("password updated");
            console.log('Password updated successfully');
        })
        .catch(error => {
            console.error('Error updating password:', error);
        });

    }
}

main();