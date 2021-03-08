// display current date/time and refresh every second 
$("#currentDay").text(moment().format('MMMM Do YYYY, h:mm a'));

var x = setInterval(function() {
    $("#currentDay").text(moment().format('MMMM Do YYYY, h:mm a'));
},1000);

displayPage(9,17); // display task list - can customize using 24 hr times. 
populateContent(); // autopopulate page with pre-existing tasks

// generates page using parameters (beginning hour, ending hour) uses 24 hour time in code, displays 12 hr time to user
function displayPage(startTime,endTime) {
    // dynamically generate HTML content for calendar according to start and end times
    for (i = startTime; i <= endTime; i++) {
        var containerEL = $('#calendarContainer');

        // create new container for hour row
        var newRow = document.createElement("div");
        newRow.setAttribute("class","row p-2");
        // create DIV for time on left of "table"
        var hourDiv = document.createElement("div");
        hourDiv.setAttribute("class","col-md-2 p-1 d-flex align-items-center justify-content-end border-0");
        
        // create "P" tag inside hour
        var timeP = document.createElement("p");
        timeP.setAttribute("class","p-0 m-0 d-flex align-items-start");

        // display time in friendly format (considered 24 hr clock, but most don't use)
        if (i === 0) {
            timeP.textContent = "12:00 AM";
        }
        else if (i <= 11) {
            timeP.textContent = i + ":00 AM";
        }
        else if (i === 12) {
            timeP.textContent = "12:00 PM";
        }
        else {
            timeP.textContent = i-12 + ":00 PM";
        }

        // add P to time div
        hourDiv.append(timeP);
        // put hourDiv inside newRow
        newRow.append(hourDiv);

        // create text area div
        var textAreaDiv = document.createElement("div");
        textAreaDiv.setAttribute("class","d-flex col-md-8 border-0");

        // create text area 
        var textAreaEl = document.createElement("textarea");
        textAreaEl.setAttribute("class","form-control border-0");
        textAreaEl.setAttribute("id","task"+i);

        // set background depending on time
        textAreaEl.setAttribute("style", timePosition(i));

        // use retrieveTask to autopopulate text area
        //textAreaEl.textContent = retrieveTask(i);
        
        textAreaDiv.append(textAreaEl);
        newRow.append(textAreaDiv);

        // create button div
        var buttonDiv = document.createElement("div");
        buttonDiv.setAttribute("class","col-md-2 p-1 d-flex align-items-center border-0");
        var buttonEl = document.createElement("button");
        buttonEl.textContent = "Save";
        buttonEl.setAttribute("id","saveTaskBtn"+i);
        buttonEl.setAttribute("data-taskNumber",i);
        buttonEl.setAttribute("class","btn btn-dark");

        // add button to buttonDiv and then add buttonDiv to row
        buttonDiv.append(buttonEl);
        newRow.append(buttonDiv);

        // add to container
        containerEL.append(newRow);

        // add event listeners
        var saveTaskBtn = $('#saveTaskBtn'+i);
        saveTaskBtn.on('click', function(e) {
            e.preventDefault(); // prevent default browser function for button
            var taskNumber = this.getAttribute("data-taskNumber"); // get which task we are on from data attr
            saveTask(taskNumber); // pass input for form into saveTask function to save
        });
    }   
}

// this function saves a new task, or modifies an existing task, in local storage
function saveTask(taskNumber) {
    // get textarea content for corresponding task number
    var taskContent = document.getElementById("task"+taskNumber).value;

    // if nothing exists in localstorage, then add list of tasks to local storage
    if (!localStorage.getItem("dailyTasks")) {
        // push newScore object into array, then
        var newTaskList = [];    
        var newTask = {
            id: taskNumber,
            task: taskContent  
        };
        newTaskList.push(newTask);
        // write it to local storage
        localStorage.setItem("dailyTasks",JSON.stringify(newTaskList));
    }
    // if task list already exists in localstorage, see if this specific hour is in there. if it is, modify it's current contents. if it's not, add it and then save all data back into local storage
    else {
        // extract data from localstorage
        var oldTaskList = JSON.parse(localStorage.getItem("dailyTasks"));
        // use taskPresent to see if this task is in local storage AND its position in oldTaskList array
        var present = taskPresent(oldTaskList,taskNumber)[0];
        var position = taskPresent(oldTaskList,taskNumber)[1];

        // if already exists, then edit object within array
        if (present) {
            oldTaskList[position].task = taskContent;
        }
        // otherwise, add new object to array
        else {
            oldTaskList.push({id: taskNumber, task: taskContent});
        }
        // re-insert data into local storage
        localStorage.setItem("dailyTasks",JSON.stringify(oldTaskList));
    }
}

// autofill textareas with localstorage content
function populateContent(taskNumber) {
    // only do something if local storage objects exist, otherwise do nothing (ie leave blank)
    if (localStorage.getItem("dailyTasks")) {
        // extract data from localstorage
        var oldTaskList = JSON.parse(localStorage.getItem("dailyTasks"));

        for (i = 0; i < oldTaskList.length; i++) {
            if (document.getElementById('task'+oldTaskList[i].id)) {
                var textAreaPopulate = document.getElementById('task'+oldTaskList[i].id);
                textAreaPopulate.value = oldTaskList[i].task;
            }
        }
    }
}

// returns two values: boolean if value is present or not, number indicating position in array
function taskPresent(taskList,taskNumber) {
    // set variables, present is false by default
    var present = false;
    var position = 0;
    // loop through each task in the list
    for(i = 0; i < taskList.length; i++) {
        // if task is found, reset variables
        if (taskList[i].id === taskNumber) {
            present = true;
            position = i;
        }
    }
    // return whether present and position if present
    return [present,position];
}

// returns color option for textarea background (gray, red, green - past, present, future)
// input is in abbreviated 24 hr time 00-24
function timePosition(hour) {
    var currentTime = moment().format('HH'); // get current hour of day in 24 hr time

    if (currentTime > hour) {
        return "background: gray; color: black";
    }
    else if (currentTime < hour) {
        return "background: green; color: black";
    }
    else {
        return "background: red; color: black";
    }
}