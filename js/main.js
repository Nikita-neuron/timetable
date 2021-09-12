const headerButtonAdd = document.querySelector(".header-button-add");
const dialogs = document.querySelector(".dialogs");
const main = document.querySelector(".main");

const buttonWeekLeft = document.querySelector(".button-week-left");
const buttonWeekRight = document.querySelector(".button-week-right");

const server = "https://homeworktablejs.herokuapp.com/";

// отправка POST запроса на сервер
const sendDataPost = async function(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
  
    if (!response.ok) {
      throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
    }
  
    return await response.json();
};

// получение данных с сервера
const getData = async function(url) {
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
    }
    return await response.json();
}

// количество дней в месяце
function daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

// получение недели (число, месяц) 6 дней
function getWeek(day, dayWeek, month, year) {
    const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

    let currnetWeekDay = dayWeek;
    currnetWeekDay = currnetWeekDay == 0 ? 7 : currnetWeekDay;

    let firstDay = day - currnetWeekDay + 1;
    let preMonthBool = false;
    let preYearBool = false;
    let preMonth = month;

    if (firstDay <= 0) {
        if (preMonth == 0) {
            preMonth = 11;
            year--;
            firstDay = daysInMonth(preMonth, year-1) + firstDay;
            preYearBool = true;
        } else {
            preMonth--;
            preMonth = preMonth < 0 ? (-1)*preMonth - 1 : preMonth;
            firstDay = daysInMonth(preMonth, year) + firstDay;
        }
        preMonthBool = true;
    }

    let week = {}
    let currMonth = preMonth;

    for (let day = 1; day <= 6; day++) {
        if (preMonthBool && firstDay > daysInMonth(preMonth, year)) {
            firstDay = 1;
            currMonth = currMonth == 11 ? 0 : ++currMonth;
            preMonthBool = false;
            year = preYearBool ? year++ : year;
            preYearBool = false;
        }
        if (!preMonthBool && firstDay > daysInMonth(month, year)) {
            firstDay = 1;
            currMonth++;
        }
        week[day] = {};
        week[day]["day"] = firstDay;
        week[day]["month"] = monthNames[currMonth];

        firstDay++;
    }

    return week;
}

// обновление записей
function updateCards(day, week, month, year) {
    main.textContent = "";
    const days =["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

    let currWeek = getWeek(day, week, month, year);
    // let currWeek = getWeek(1, 3, today.getMonth(), today.getUTCFullYear());
    let currWeekDays = [];
    let currWeekMonth = [];

    // добавление дней недели
    for (let day = 1; day <= 6; day++) {
        let htmlCard = `
            <div class="table-day" id=d${currWeek[day]["day"]}>
                <h2 class="table-day-header">${days[day]}, ${currWeek[day]["day"]} ${currWeek[day]["month"]}</h2>
                <div class="table-day-tasks">
                    <div class="day-task">
                        <p class="day-task-lesson-body nothomework">Не задано</p>
                    </div>   
                </div>
            </div>
        `;
        currWeekDays.push(currWeek[day]["day"]);
        currWeekMonth.push(currWeek[day]["month"]);
        main.insertAdjacentHTML('beforeend', htmlCard);
    }

    // добавление заданий
    for (let date in homework_data) {
        let currDate = new Date(date);
        if (currWeekMonth[currWeekDays.indexOf(currDate.getDate())] == monthNames[currDate.getMonth()]) {
            const tableDay = main.querySelector(`#d${currDate.getDate()}`);
            const tableDayTasks = tableDay.querySelector(".table-day-tasks");

            let tasks = homework_data[date];

            if (tasks.length > 0) {
                tableDayTasks.textContent = "";
                for (let elem in tasks) {
                    let card = `
                    <div class="day-task">
                        <div class="day-task-lesson">
                            <h3 class="day-task-lesson-name">${tasks[elem]["name"]}</h3>
                            <div class="day-task-lesson-body">
                                <p class="day-task-lesson-body-text">${tasks[elem]["homework"]}</p>
                            </div>
                        </div>
                        <div class="day-task-buttons">
                            <button class="day-task-button button-edit">
                                <img src="./img/edit.svg" alt="edit" class="day-task-button-edit-img icon">
                            </button>
                            <button class="day-task-button button-delete">
                                <img src="./img/delete.svg" alt="delete" class="day-task-button-delete-img icon">
                            </button>
                        </div>
                    </div>
                    `;
                    tableDayTasks.insertAdjacentHTML('afterbegin', card);

                    const dayTask = tableDayTasks.children[0];
                    const dayTaskButtonDelete = dayTask.querySelector(".button-delete");
                    const buttonEdit = dayTask.querySelector(".button-edit");

                    buttonEdit.addEventListener('click', e => {
                        alert("Данная кнопка пока не работает");
                    });

                    dayTaskButtonDelete.addEventListener('click', e => {
                        dialogDeleteTask(date, tasks[elem]["name"], tasks[elem]["homework"]);
                    });
                }
            }
        }
    }
}

// диалоговое окно удаления записи
function dialogDeleteTask(date, name, homework) {
    dialogs.style.display = "flex";

    dialogs.textContent = "";

    let htmlCard = `
    <div class="dialog dialog-delete">
        <div class="dialog-body dialog-delete-body">
            <p>Удалить запись?</p>
        </div>
        <div class="dialog-buttons dialog-delete-buttons">
            <button class="dialog-button-add dialog-delete-button-add">Да</button>
            <button class="dialog-button-close dialog-delete-button-close">Нет</button>
        </div>
    </div>
    `;

    dialogs.insertAdjacentHTML('beforeend', htmlCard);

    const dialogAddButtonAdd = dialogs.querySelector(".dialog-button-add");
    const dialogAddButtonClose = dialogs.querySelector(".dialog-button-close");

    dialogAddButtonClose.addEventListener('click', e => {
        dialogs.textContent = "";
        dialogs.style.display = "none";
    });

    dialogAddButtonAdd.addEventListener('click', e => {
        let data = {
            name: name,
            date: date,
            homework: homework
        };
        sendDataPost(server + "/tableData/delete", data).then(data => {
            if (data.message == "OK") {
                alert("Запись удалена");

                dialogs.textContent = "";
                dialogs.style.display = "none";

                getDataServer();
            }
        });
    });
}

// получение данных с сервера
function getDataServer() {
    // получение записей с сервера
    let today = new Date();
    getData(server + "/tableData/get").then(data => {
        if (data.message == "OK") {
            let hw = data.body;
            main.textContent = "";

            homework_data = hw;
            updateCards(today.getDate(), today.getDay(), today.getMonth(), today.getFullYear());
        }
    });

    updateCards(today.getDate(), today.getDay(), today.getMonth(), today.getFullYear());
}

const today = new Date();
let homework_data = {};
let currDate = today.getDate();
let currMonth = today.getMonth();
let currYear = today.getFullYear();

getDataServer();

// нажатие кнопки Добавить
headerButtonAdd.addEventListener('click', e => {
    dialogs.style.display = "flex";

    dialogs.textContent = "";

    let htmlCard = `
    <div class="dialog dialog-add">
        <div class="dialog-body dialog-add-body">
            <select class="lesson-name">
                <option disabled selected value="Название предмета">Название предмета</option>
                <option value="Математический анализ">Математический анализ</option>
                <option value="Линейная алгебра и аналитическая геометрия">Линейная алгебра</option>
                <option value="История">История</option>
                <option value="Физика">Физика</option>
                <option value="Процедурное программирование">Процедурное программирование</option>
                <option value="Физическая культура и спорт">Физическая культура и спорт</option>
                <option value="Информатика">Информатика</option>
                <option value="Ин.яз.">Ин.яз.</option>
            </select>
            <input type="date" class="lesson-date">
            <textarea class="lesson-homework"></textarea>
        </div>
        <div class="dialog-buttons dialog-add-buttons">
            <button class="dialog-button-add dialog-add-button-add">Добавить</button>
            <button class="dialog-button-close dialog-add-button-close">Отмена</button>
        </div>
    </div>
    `;

    dialogs.insertAdjacentHTML('beforeend', htmlCard);

    const dialogAddButtonAdd = dialogs.querySelector(".dialog-add-button-add");
    const dialogAddButtonClose = dialogs.querySelector(".dialog-add-button-close");
    const lessonName = dialogs.querySelector(".lesson-name");
    const lessonDate = dialogs.querySelector(".lesson-date");
    const lessonHomework = dialogs.querySelector(".lesson-homework");

    lessonHomework.addEventListener('input', e => {
        lessonHomework.style.height = "1px";
        lessonHomework.style.height = (lessonHomework.scrollHeight)+"px";
    });

    dialogAddButtonClose.addEventListener('click', e => {
        dialogs.textContent = "";
        dialogs.style.display = "none";
    });

    dialogAddButtonAdd.addEventListener('click', e => {
        let name = lessonName.options[lessonName.selectedIndex].text;
        let date = lessonDate.value;
        let homework = lessonHomework.value;

        if (name != "Название предмета" && date != "" && homework != "") {
            let repTask = false;
            for (let dbDate in homework_data) {
                if (date == dbDate) {
                    let tasks = homework_data[date];
                    for (let elem in tasks) {
                        if (tasks[elem]["name"] == name) repTask = true;
                    }
                } 
            }
            
            if (repTask) {
                alert("Для данного предмета запись уже существует");
            } else {
                let data = {
                    name: name,
                    date: date,
                    homework: homework
                };
                sendDataPost(server + "/tableData/update", data).then(data => {
                    console.log(data);
                });
    
                dialogs.textContent = "";
                dialogs.style.display = "none";
    
                getDataServer();
            }
        }
    });
});

// предыдущая неделя
buttonWeekLeft.addEventListener('click', e => {
    if (currDate < 7) {
        if (currMonth == 0) {
            currMonth = 11;
            currYear = today.getFullYear() - 1;
        } else {
            currMonth = currMonth - 1;
            currYear = today.getFullYear();
        }
        currDate = daysInMonth(currMonth, currYear) + currDate - 7;
    } else {
        currDate -= 7;
    }

    updateCards(currDate, today.getDay(), currMonth, currYear);
});

// следующая неделя
buttonWeekRight.addEventListener('click', e => {
    if (currDate + 7 > daysInMonth(currMonth, currYear)) {
        currDate = currDate + 7 - daysInMonth(currMonth, currYear);
        if (currMonth == 11) {
            currMonth = 0;
            currYear++;
        } else {
            currMonth++;
        }
    } else {
        currDate += 7;
    }
    updateCards(currDate, today.getDay(), currMonth, currYear);
});