
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");

// Load saved tasks from the browser.
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("studyMateTasks")) || [];
} catch (error) {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("studyMateTasks", JSON.stringify(tasks));
}

function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getDeadline(task) {
    return new Date(task.date + "T00:00:00");
}

function getDeadlineStatus(task) {
    if (task.completed) {
        return "Completed";
    }

    const deadline = getDeadline(task);
    const today = getToday();

    if (deadline < today) {
        return "Overdue";
    }

    if (deadline.getTime() === today.getTime()) {
        return "Due Today";
    }

    return "Upcoming";
}

// FEATURE 1: SMART TASK MANAGEMENT

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const titleValue = taskTitle.value.trim();
    const dateValue = taskDate.value;

    if (!titleValue || !dateValue) {
        return;
    }

    const task = {
        id: Date.now(),
        title: titleValue,
        subject: document.getElementById("taskSubject").value.trim(),
        date: dateValue,
        priority: taskPriority.value,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    taskForm.reset();
    renderTasks();
});

function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML =
            '<p class="empty-message">No tasks yet. Add your first task!</p>';
    }

    tasks.forEach(function (task) {
        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const subject = document.createElement("p");
        subject.textContent =
            "Subject: " + (task.subject || "Not specified");

        const date = document.createElement("p");
        date.textContent = "Deadline: " + task.date;

        const priority = document.createElement("p");
        priority.textContent = "Priority: " + task.priority;

        if (task.priority === "High") {
            priority.classList.add("priority-high");
        } else if (task.priority === "Low") {
            priority.classList.add("priority-low");
        } else {
            priority.classList.add("priority-normal");
        }

        details.append(title, subject, date, priority);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.className = "complete-button";
        completeButton.textContent = task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", function () {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (savedTask) {
                return savedTask.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

        actions.append(completeButton, deleteButton);
        item.append(details, actions);
        taskList.appendChild(item);
    });

    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(function (task) {
            return task.completed;
        }).length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(function (task) {
            return !task.completed;
        }).length;

    document.getElementById("taskCountLabel").textContent =
        tasks.length + (tasks.length === 1 ? " task" : " tasks");

    saveTasks();
    updateDeadlineTracker();
}

// FEATURE 2: DEADLINE TRACKER AND REMINDERS

function updateDeadlineTracker() {
    const deadlineList = document.getElementById("deadlineList");
    deadlineList.innerHTML = "";

    if (tasks.length === 0) {
        deadlineList.innerHTML =
            '<p class="empty-message">No deadlines to track yet. Add a task first!</p>';
        return;
    }

    const sortedTasks = [...tasks].sort(function (a, b) {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        return getDeadline(a) - getDeadline(b);
    });

    sortedTasks.forEach(function (task) {
        const item = document.createElement("div");
        item.className = "task-item";

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const date = document.createElement("p");
        date.textContent = "Deadline: " + task.date;

        const status = document.createElement("p");
        const statusValue = getDeadlineStatus(task);

        status.textContent = "Status: " + statusValue;

        if (statusValue === "Overdue") {
            status.className = "status-overdue";
        } else if (statusValue === "Due Today") {
            status.className = "status-today";
        } else if (statusValue === "Completed") {
            status.className = "status-completed";
        } else {
            status.className = "status-upcoming";
        }

        details.append(title, date, status);
        item.appendChild(details);
        deadlineList.appendChild(item);
    });
}

// FEATURE 3: AI-BASED TASK PATTERN ANALYSIS

document.getElementById("analyzeButton").addEventListener("click", function () {
    const result = document.getElementById("analysisResult");

    if (tasks.length === 0) {
        result.textContent =
            "Add your school tasks first so I can help you plan your work.";
        return;
    }

    const pending = tasks.filter(function (task) {
        return !task.completed;
    });

    if (pending.length === 0) {
        result.textContent =
            "Great job! You have completed all your tasks. Keep it up!";
        return;
    }

    const priorityOrder = {
        High: 1,
        Normal: 2,
        Low: 3
    };

    pending.sort(function (a, b) {
        const priorityA = priorityOrder[a.priority] || 2;
        const priorityB = priorityOrder[b.priority] || 2;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return getDeadline(a) - getDeadline(b);
    });

    const nextTask = pending[0];
    const status = getDeadlineStatus(nextTask);

    let advice = "";

    if (status === "Overdue") {
        advice = "This task is overdue. Review it and plan to complete it soon.";
    } else if (status === "Due Today") {
        advice = "This task is due today, so consider working on it first.";
    } else if (nextTask.priority === "High") {
        advice = "This is a high-priority task. Give it attention early.";
    } else {
        advice = "Start this task early and divide it into smaller steps.";
    }

    const overdueCount = pending.filter(function (task) {
        return getDeadlineStatus(task) === "Overdue";
    }).length;

    result.textContent =
        "Suggested task: " + nextTask.title +
        ". Subject: " + (nextTask.subject || "Not specified") +
        ". Priority: " + nextTask.priority +
        ". Deadline: " + nextTask.date +
        ". Pending tasks: " + pending.length +
        ". Overdue tasks: " + overdueCount +
        ". Advice: " + advice;
});

// FEATURE 4: PERSONALIZED AI SUGGESTIONS

document.getElementById("suggestionsButton").addEventListener("click", function () {
    const result = document.getElementById("suggestionsResult");

    if (tasks.length === 0) {
        result.textContent =
            "Add your school tasks first to receive personalized study suggestions.";
        return;
    }

    const pending = tasks.filter(function (task) {
        return !task.completed;
    });

    if (pending.length === 0) {
        result.textContent =
            "All your tasks are completed! Keep up your good study habits.";
        return;
    }

    const overdue = pending.filter(function (task) {
        return getDeadlineStatus(task) === "Overdue";
    });

    const dueToday = pending.filter(function (task) {
        return getDeadlineStatus(task) === "Due Today";
    });

    const highPriority = pending.filter(function (task) {
        return task.priority === "High";
    });

    const advice = [];

    if (overdue.length > 0) {
        advice.push(
            "You have " + overdue.length +
            " overdue task(s). Review these and make a realistic catch-up plan."
        );
    }

    if (dueToday.length > 0) {
        advice.push(
            "You have " + dueToday.length +
            " task(s) due today. Give these deadlines special attention."
        );
    }

    if (highPriority.length > 0) {
        advice.push(
            "Consider starting with this high-priority task: " +
            highPriority[0].title + "."
        );
    }

    if (pending.length >= 5) {
        advice.push(
            "You have several pending tasks. Focus on one task at a time and take short breaks."
        );
    } else {
        advice.push(
            "Break your assignments into smaller steps and schedule time to work on them."
        );
    }

    if (advice.length === 0) {
        advice.push(
            "Choose the task with the nearest deadline and make a simple study plan."
        );
    }

    result.textContent = advice.join(" ");
});

// Display saved tasks when the website opens.
renderTasks();