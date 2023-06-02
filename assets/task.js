const COMPLETED = 0;
const PRIORITY = 1;
const DATE_DONE = 2;
const DATE_CREATED = 3;
const DESCRIPTION = 4;
const TAGS = 5;

export class Task {
    constructor(line) {
        this.completed = false;
        this.priority = ""
        this.date_done = "";
        this.date_created = "";
        this.description = "";
        this.project = "";
        this.context = "";
        this.special = "";
        this.rec = "";
        this.due = "";

        let state = COMPLETED;
        let words = line.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (state == COMPLETED) {
                if (words[i] == "x") {
                    this.completed = true;
                    i++;
                }
                state++;
            }
            
            if (state == PRIORITY) {
                if ((words[i][0] == '(') && (words[i][2] == ')')) {
                    this.priority = words[i][1];
                    i++;
                }
                state++;
            }
            
            if (state == DATE_DONE) {
                if (/\d{4}-\d{2}-\d{2}/.test(words[i])) {
                    this.date_done = words[i];
                    i++;
                }
                state++;
            }
            
            if (state == DATE_CREATED) {
                if (/\d{4}-\d{2}-\d{2}/.test(words[i])) {
                    this.date_created = words[i];
                    i++;
                }
                else {
                    this.date_created = this.date_done;
                    this.date_done = "";
                }
                state++;
            }
            
            if (state == DESCRIPTION) {
                if ((words[i][0] == '@') || (words[i][0] == '+') || (words[i][3] == ':')) {
                    state++;
                }
                else {
                    this.description += words[i] + " ";
                }
            }
            
            if (state == TAGS) {
                if (words[i][0] == '+') {
                    this.project += words[i] + " ";
                }
                else if (words[i][0] == '@') {
                    this.context += words[i] + " ";
                }
                else if (words[i].startsWith("due:")) {
                    this.due = words[i].substring(4);
                }
                else if (words[i].startsWith("pri:")) {
                    this.priority = words[i].substring(4);
                }
                else if (words[i].startsWith("rec:")) {
                    this.rec = words[i].substring(4);
                }
                else {
                    this.special += words[i] + " ";
                }
            }
        }
        this.description = this.description.trim();
        this.project = this.project.trim();
        this.context = this.context.trim();
        this.special = this.special.trim();
    }
    
    get() {
        let text = "";
        if (this.completed) {
            text = "x ";
        }
        else if (this.priority != "") {
            text += "(" + this.priority + ") ";
        }
        if (this.date_done != "") {
            text += this.date_done + " ";
        }
        if (this.date_created != "") {
            text += this.date_created + " ";
        }
        if (this.description != "") {
            text += this.description + " ";
        }
        if (this.project != "") {
            text += this.project + " ";
        }
        if (this.context != "") {
            text += this.context + " ";
        }
        if (this.special != "") {
            text += this.special + " ";
        }
        if (this.due != "") {
            text += "due:" + this.due + " ";
        }
        if (this.rec != "") {
            text += "rec:" + this.rec + " ";
        }
        if ((this.completed) && (this.priority != "")) {
            text += " pri:" + this.priority;
        }
        return text.trim();
    }

    display() {
        let text = "";
        if (this.completed) {
            text = "x ";
        }
        else if (this.priority != "") {
            text += "(" + this.priority + ") ";
        }
        if (this.completed) {
            if (this.date_done != "") {
                text += this.date_done + " ";
            }
            if (this.date_created != "") {
                text += this.date_created + " ";
            }
        }
        if (this.description != "") {
            text += this.description + " ";
        }
        if (this.project != "") {
            text += this.project + " ";
        }
        if (this.context != "") {
            text += this.context + " ";
        }
        if (this.rec != "") {
            text += "rec:" + this.rec + " ";
        }
        if (this.special != "") {
            text += this.special + " ";
        }
        if (this.completed) {
            if (this.due != "") {
                text += "due:" + this.due + " ";
            }
            if (this.priority != "") {
                text += "pri:" + this.priority;
            }
        }
        return text.trim();
    }
}
