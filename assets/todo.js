import {Task} from "./task.js";

export class ToDo {
    constructor() {
        this.tasks = Array();
        this.contexts = Array();
        this.projects = Array();
        this.changingTask = -1;
        this.changed = false;
    }
    
    reload(file, callback)
    {
        if (file) {
            let todo = this;
            window.localStorage.removeItem("todo");
            let reader = new FileReader();
            reader.addEventListener("load", function() {
                window.localStorage.setItem("todo", reader.result);
                todo.parse(reader.result);
                todo.changed = false;
                callback();
            });
            reader.readAsText(file);
        }
    }
    
    read(callback)
    {
        let todo = this;
        let stored = window.localStorage.getItem("todo");
        if (stored) {
            todo.parse(stored);
            callback();
        }
    }
    
    
    write()
    {
        window.localStorage.setItem("todo", this.getText());
        $("#downloadToDo2").show(250);
        this.changed = true;
    }
    
    
    writeAsFile()
    {
        let a = document.createElement('a');
        let blob = new Blob([this.getText()]);
        a.href = URL.createObjectURL(blob);
        a.download = 'todo.txt';
        a.click();
        this.changed = false;
        $("#downloadToDo2").hide(250);
    } 
    
    
    getText()
    {
        let text = "";
        this.tasks.forEach(function(task) {
            text += task.get() + "\n";
        });
        return text;
    }
    
    
    parse(text)
    {
        let todo = this;
        todo.tasks = [];
        todo.contexts = [];
        todo.projects = [];
        let lines = text.split('\n');
        lines.forEach(function(line) {
            if (line != "") {
                let task = new Task(line);
                todo.tasks.push(task);
                todo.getContexts(task);
                todo.getProjects(task);
            }
        });
        this.sort();
    }
    
    
    add(task)
    {
        this.tasks.push(task);
        this.getContexts(task);
        this.getProjects(task);
        this.sort();
    }
    
    
    change(task)
    {
        this.tasks[this.changingTask] = task;
        this.getContexts(task);
        this.getProjects(task);
        this.sort();
        this.changingTask = -1;
    }
    
    
    deleteTask(taskId)
    {
        let last = this.tasks.length - 1;
        this.tasks[taskId] = this.tasks[last];
        this.tasks.pop();
        this.sort();
        this.changingTask = -1;
    }

    
    sort()
    {
        const a4b = -1;
        const b4a = 1;
        this.tasks.sort(function(a, b) {
            let order = 0;
            if (a.completed == b.completed) {
                let aDate = a.due;
                let bDate = b.due;
                if (a.completed) {
                    aDate = a.date_done;
                    bDate = b.date_done;
                }
                if (aDate == bDate) {
                    if (a.priority > b.priority) {
                        order = b4a;
                    }
                    else if (a.priority < b.priority) {
                        order = a4b;
                    }
                }
                else if (aDate == "") {
                    order = b4a;
                }
                else if (bDate == "") {
                    order = a4b;
                }
                else if (aDate > bDate) {
                    if (a.completed) {order = a4b} else {order = b4a};
                }
                else if (aDate < bDate) {
                    if (a.completed) {order = b4a} else {order = a4b};
                }
            }
            else if (a.completed) {
                order = b4a;
            }
            else if (b.completed) {
                order = a4b;
            }
            return order;
        });
    }
    
    
    getContexts(task)
    {
        if (task.context != "") {
            let todo = this;
            let items = task.context.split(" ");
            items.forEach(function(item) {
                if (!todo.contexts.includes(item)) {
                    todo.contexts.push(item);
                }
            });
        }
    }
    
    
    getProjects(task)
    {
        if (task.project != "") {
            let todo = this;
            let items = task.project.split(" ");
            items.forEach(function(item) {
                if (!todo.projects.includes(item)) {
                    todo.projects.push(item);
                }
            });
        }
    }
    
}
