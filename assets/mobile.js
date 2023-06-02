import {UI} from "./ui.js";
import {Task} from "./task.js";
import {ToDo} from "./todo.js";

let ui = new UI();
let todo = new ToDo();

$(function() {
    todo.read(function() {
        ui.showTasks(todo);
        ui.showKeys(todo);
    });
    
    $("#optionMode").click(function() {
        ui.gotoNextMode();
    });
    
    $("#optionSettings").click(function() {
        ui.gotoSettings();
    });
    
    $("#setTheme").change(function() {
        ui.setTheme();
    });
    
    $("#reloadToDo").click(function() {
        todo.reload(function() {
            ui.showTasks(todo);
            ui.showKeys(todo);
        });
    });

    
    $("#newDescription").keyup(function() {
        $('#optionSave').attr('disabled', ($(this).val() == ""));
    });
    
    $("#optionSave").click(function() {
        ui.saveTask(todo);
        todo.write();
    });
    
    $("#optionDelete").click(function() {
        ui.deleteTask(todo);
        todo.write();
    });
    
    $("#optionContext").click(function() {
        ui.hideSettings();
    });
    
    $("#optionProject").click(function() {
        ui.hideSettings();
    });
    
    $("#optionContext").change(function() {
        ui.showTasks(todo);
    });

    $("#optionProject").change(function() {
        ui.showTasks(todo);
    });
})
