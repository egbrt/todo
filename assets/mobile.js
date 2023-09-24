import {UI} from "./ui.js";
import {Task} from "./task.js";
import {ToDo} from "./todo.js";

let ui = new UI();
let todo = new ToDo();

$(function() {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('worker.js');
    }

    todo.read(function() {
        ui.showTasks(todo);
        ui.showKeys(todo);
    });
    
    $("#uploadToDo").change(function() {
        todo.reload(this.files[0], function() {
            ui.showTasks(todo);
            ui.showKeys(todo);
        });
    });
    
    $("#downloadToDo").click(function() {
        todo.writeAsFile();
    });
    
    $("#downloadToDo2").click(function() {
        todo.writeAsFile();
    });

    $("#optionMode").change(function() {
        ui.gotoMode();
    });
    
    $("#optionCancel").click(function() {
        ui.cancelEditing();
    });
    
    $("#optionSettings").click(function() {
        ui.gotoSettings();
    });
    
    $("#setTheme").change(function() {
        ui.setTheme();
    });
    
    $("#setPriority").change(function() {
        ui.setPriorityDisplay(todo);
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

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', function(e) {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        deferredPrompt = e;
        $('#installAsApp').show();
    });

    $('#installAsApp').click(function(e) {
        $('#installAsApp').hide();
        deferredPrompt.prompt();
    });

})
