import {Task} from "./task.js";
import {ToDo} from "./todo.js";

const CHECK = "Check";
const EDIT = "Edit";
const ADD = "Add";
const DELETE = "Delete";
const EDITING = "Cancel";
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const LIGHT_THEME = "light";
const DARK_THEME = "dark";

export class UI {
    constructor() {
        this.mode = CHECK;
        this.theme = LIGHT_THEME;
        this.settingsVisible = false;
        this.deleteNumber = 0;
        this.deleteType = "d";
        this.delayedComplete = null;

        let stored = window.localStorage.getItem("theme");
        if (stored) this.theme = stored;
        $("#setTheme").val(this.theme);
        $('body').attr('theme', this.theme);

        stored = window.localStorage.getItem("deleteNumber");
        if (stored) this.deleteNumber = stored;
        stored = window.localStorage.getItem("deleteType");
        if (stored) this.deleteType = stored;

        this.prepareNewTask();
    }
    
    prepareNewTask()
    {
        let ui = this;
        let priorities = "ABCDEF";
        priorities.split('').forEach(function(priority) {
            $("#newPriority").append("<option value=\"" + priority + "\">" + priority + "</option>");
        });
        
        let recurrences = "0 1 2 3 4 5 6";
        recurrences.split(' ').forEach(function(recurrence) {
            $("#newRecurrenceNumber").append("<option value=\"" + recurrence + "\">" + recurrence + "</option>");
            $("#setDeleteNumber").append("<option value=\"" + recurrence + "\">" + recurrence + "</option>");
        });
        $("#setDeleteNumber").val(ui.deleteNumber);

        recurrences = "days weeks months years";
        recurrences.split(' ').forEach(function(recurrence) {
            $("#newRecurrenceType").append("<option value=\"" + recurrence[0] + "\">" + recurrence + "</option>");
            $("#setDeleteType").append("<option value=\"" + recurrence[0] + "\">" + recurrence + "</option>");
        });
        $("#setDeleteType").val(ui.deleteType);
    }
    
    showKeys(todo)
    {
        let ui = this;
        todo.contexts.sort();
        $("#optionContext").empty();
        $("#newContexts ul").empty();
        $("#optionContext").append("<option value=\"@any\">@any</option>");
        todo.contexts.forEach(function(item) {
            $("#optionContext").append("<option value=\"" + item + "\">" + item + "</option>");
            $("#newContexts ul").append("<li id=\"" + item + "\">" + item + "</li>");
        });

        todo.projects.sort();
        $("#optionProject").empty();
        $("#newProjects ul").empty();
        $("#optionProject").append("<option value=\"+all\">+all</option>");
        todo.projects.forEach(function(item) {
            $("#optionProject").append("<option value=\"" + item + "\">" + item + "</option>");
            $("#newProjects ul").append("<li id=\"" + item + "\">" + item + "</li>");
        });
        
        $(".selection ul li").click(function() {
            $(this).toggleClass("selected");
            if ($(this).hasClass("selected")) {
                ui.addToKeys(this.id);
            }
            else {
                ui.removeFromKeys(this.id);
            }
        });
    }

    addToKeys(key)
    {
        let keys = $("#newKeys").val();
        let i = keys.indexOf(key);
        if (i < 0) {
            if (keys != "") keys += " ";
            keys += key;
            $("#newKeys").val(keys);
        }
    }
    
    
    removeFromKeys(key)
    {
        let newKeys = "";
        let keys = $("#newKeys").val().split(" ");
        keys.forEach(function(oldKey) {
            if (oldKey != key) newKeys += oldKey + " ";
        });
        $("#newKeys").val(newKeys.trim());
    }
    
    
    showTasks(todo)
    {
        let ui = this;
        ui.hideSettings();
        $("#dueToDo").empty();
        let currentContext = $("#optionContext").val();
        let currentProject = $("#optionProject").val();
        
        let tree = "";
        let showDate = "";
        let shownDate = "-";
        let completed = false;

        ui.deleteCompletedTasks(todo);
        todo.tasks.forEach(function(task, i) {
            if ((currentContext == "@any") || (task.context.indexOf(currentContext) >= 0)) {
                if ((currentProject == "+all") || (task.project.indexOf(currentProject) >= 0)) {
                    if (task.completed) {
                        if (!completed) {
                            if (tree != "") tree += "</ul>";
                            tree += "<p class=\"completed\">Completed</p><ul>";
                            completed = true;
                            shownDate = "-";
                        }
                        showDate = task.date_done;
                    }
                    else {
                        showDate = task.due;
                    }
                    if (showDate != shownDate) {
                        if (shownDate != "-") tree += "</ul>";
                        shownDate = showDate;
                        tree += "<p class=\"dueDate";
                        if (completed) tree += " completed";
                        tree += "\">";
                        if (shownDate == "") {
                            tree += "No due date set";
                        }
                        else {
                            tree += ui.getDate(shownDate);
                        }
                        tree += "</p><ul class=\"tasks\">";
                    }
                    tree += "<li id=\"" + i + "\">" + task.display() + "</li>";
                }
            }
        });
        if (completed) tree += "</ul>";
        if (shownDate != "-") tree += "</ul>";
        $("#dueToDo").append(tree);
        
        $("#dueToDo ul li").click(function() {
            if (ui.mode == CHECK) {
                ui.delayedCheck(this, todo);
            }
            else if (ui.mode == DELETE) {
                ui.delayedCheck(this, todo);
            }
            else { // ui.mode == EDIT
                todo.changingTask = this.id;
                ui.editTask(todo.tasks[this.id]);
            }
        });
    }
    
    
    delayedCheck(item, todo)
    {
        let ui = this;
        let mark = "checked";
        if (ui.mode == DELETE) mark = "deleting";           
        
        if ($(item).hasClass(mark)) {
            $(item).removeClass(mark);
            clearTimeout(ui.delayedComplete);
        }
        else {
            let taskId = item.id;
            $(item).addClass(mark);
            ui.delayedComplete = setTimeout(function() {
                if (ui.mode == CHECK) {
                    ui.checkTask(todo.tasks[taskId]);
                    todo.sort();
                }
                else if (ui.mode == DELETE) {
                    todo.deleteTask(taskId);
                    ui.showKeys(todo);
                }
                todo.write();
                ui.showTasks(todo);
            }, 3000);
        }
    }


    deleteCompletedTasks(todo)
    {
        if (this.deleteNumber > 0) {
            let ui = this;
            let deleted = false;
            let i = 0;
            let now = new Date();
            let nowDate = now.toISOString().substr(0,10);
            
            while (i < todo.tasks.length) {
                if (todo.tasks[i].completed) {
                    let date = new Date(todo.tasks[i].date_done);
                    let deleteAt = ui.computeDate(date, ui.deleteNumber, ui.deleteType);
                    if (deleteAt <= nowDate) {
                        let last = todo.tasks.length - 1;
                        if (i < last) {
                            todo.tasks[i] = todo.tasks[last];
                        }
                        else {
                            i--;
                        }
                        todo.tasks.pop();
                        deleted = true;
                    }
                }
                i++;
            }
            if (deleted) {
                todo.write();
                todo.sort();
            }
        }
    }
    
    
    
    getDate(theDate)
    {
        let text = "";
        let now = new Date().toISOString().substr(0,10);
        let tomorrow = new Date();
        let yesterday = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        yesterday.setDate(yesterday.getDate() - 1);
        if (theDate == now) {
            text = "Today " + theDate;
        }
        else if (theDate == tomorrow.toISOString().substr(0,10)) {
            text = "Tomorrow " + theDate;
        }
        else if (theDate == yesterday.toISOString().substr(0,10)) {
            text = "Yesterday " + theDate;
        }
        else {
            let date = new Date(theDate);
            text = weekday[date.getDay()] + " " + theDate;
        }
        return text;
    }
    
    
    checkTask(task)
    {
        if (task.rec == "") {
            task.completed = !task.completed;
            if (task.completed) {
                let now = new Date();
                task.date_done = now.toISOString().substr(0,10);
                if (this.deleteNumber > 0) {
                    task.date_delete = this.computeDate(now, this.deleteNumber, this.deleteType);
                }
            }
            else {
                task.date_done = "";
                task.date_delete = "";
            }
        }
        else {
            let due = new Date();
            if (task.due != "") due = new Date(task.due);
            task.due = this.computeDate(due, task.rec[0], task.rec[1]);
        }
    }
    
    
    computeDate(date, num, type)
    {
        let number = parseInt(num);
        if (type == "d") {
            date.setDate(date.getDate() + number);
        }
        else if (type == "w") {
            date.setDate(date.getDate() + 7*number);
        }
        else if (type == "m") {
            date.setMonth(date.getMonth() + number);
        }
        else if (type == "y") {
            date.setFullYear(date.getFullYear() + number);
        }
        return date.toISOString().substr(0,10);
    }
    
    
    editTask(task)
    {
        task.project.split(' ').forEach(function(item) {
            $("#\\" + item).addClass("selected");
        });
        task.context.split(' ').forEach(function(item) {
            $("#\\" + item).addClass("selected");
        });
        
        let keys = task.project + " ";
        keys += task.context + " ";
        keys += task.special;
        $("#newPriority").val(task.priority);
        $("#newDescription").val(task.description);
        if (task.rec != "") {
            $("#newRecurrenceNumber").val(task.rec[0]);
            $("#newRecurrenceType").val(task.rec[1]);
        }
        $("#newKeys").val(keys);
        $("#newDueDate").val(task.due);
        $("#dueToDo").hide();
        $("#optionContext").hide();
        $("#optionProject").hide();
        $("#newToDo").show(250);
        $("#optionSave").show();
        $('#optionSave').attr('disabled', ($("#newDescription").val() == ""));
        $("#optionMode").hide();
        $("#optionCancel").show();
        this.mode = EDITING;
    }
    
    
    cancelEditing()
    {
        $("#newToDo").hide();
        $("#optionSave").hide();
        $("#optionCancel").hide();
        $("#optionMode").show();
        $("#dueToDo").show(250);
        $("#optionContext").show();
        $("#optionProject").show();
        this.mode = EDIT;
    }
    

    saveTask(todo)
    {
        let date = new Date().toISOString().substr(0,10);
        let line = "(" + $("#newPriority").val() + ") ";
        line += date + " ";
        line += $("#newDescription").val() + " ";
        line += $("#newKeys").val() + " ";
        line += "due:" + $("#newDueDate").val();
        let recNumber = $("#newRecurrenceNumber").val();
        let recType = $("#newRecurrenceType").val();
        if (recNumber > 0) line += " rec:" + recNumber + recType;
        let task = new Task(line);
        if (this.mode == ADD) {
            todo.add(task);
        }
        else if (this.mode == EDITING) {
            todo.change(task);
            this.cancelEditing();
        }
        this.showTasks(todo);
        this.showKeys(todo);
        this.clearNew();
    }
    
    
    gotoMode()
    {
        this.hideSettings();
        this.mode = $("#optionMode").val();
        if (this.mode == ADD) {
            this.clearNew();
            $("#dueToDo").hide();
            $("#optionContext").hide();
            $("#optionProject").hide();
            $("#newToDo").show(250);
            $("#optionSave").show();
            $('#optionSave').attr('disabled', ($("#newDescription").val() == ""));
            let date = new Date().toISOString().substr(0,10);
            $("#newDueDate").val(date);
        }
        else { // CHECK
            $("#newToDo").hide();
            $("#optionSave").hide();
            $("#optionDelete").hide();
            $("#dueToDo").show(250);
            $("#optionContext").show();
            $("#optionProject").show();
        }
    }
    
    
    clearNew()
    {
        $("#newPriority").val("A");
        $("#newDescription").val("");
        $("#newKeys").val("");
        $("#optionSave").attr("disabled", true);
        $("#newRecurrenceNumber").val("0");
        $("#newRecurrenceType").val("d");
        $(".selection ul li.selected").each(function() {
            $(this).removeClass("selected");
        });
    }
    
    gotoSettings()
    {
        if (this.settingsVisible) {
            this.hideSettings();
        }
        else {
            this.settingsVisible = true;
            $("#settings").show(250);
        }
    }
    
    hideSettings()
    {
        if (this.settingsVisible) {
            this.deleteNumber = $("#setDeleteNumber").val();
            this.deleteType = $("#setDeleteType").val();
            window.localStorage.setItem("deleteNumber", this.deleteNumber);
            window.localStorage.setItem("deleteType", this.deleteType);
            this.settingsVisible = false;
            $("#settings").hide(250);
        }
    }

    setTheme()
    {
        this.theme = $("#setTheme").val();
        $('body').attr('theme',this.theme);
        window.localStorage.setItem('theme',this.theme);
    }
}
