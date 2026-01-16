let goals = JSON.parse(localStorage.getItem('goals')) || [];
let progress = JSON.parse(localStorage.getItem('progress')) || {};

const today = new Date().toISOString().split('T')[0];

if (!progress[today]) {
    progress[today] = new Array(goals.length).fill(false);
}

function saveData() {
    localStorage.setItem('goals', JSON.stringify(goals));
    localStorage.setItem('progress', JSON.stringify(progress));
}

function renderGoals() {
    const list = document.getElementById('goals-list');
    list.innerHTML = '';
    goals.forEach((goal, index) => {
        const li = document.createElement('li');
        li.className = 'goal-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = progress[today][index] || false;
        checkbox.addEventListener('change', () => {
            progress[today][index] = checkbox.checked;
            checkDayCompletion();
            saveData();
        });
        const span = document.createElement('span');
        span.textContent = goal;
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
            const newText = prompt('Edit goal:', goal);
            if (newText) {
                goals[index] = newText;
                renderGoals();
                saveData();
            }
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            goals.splice(index, 1);
            Object.keys(progress).forEach(date => {
                progress[date].splice(index, 1);
            });
            renderGoals();
            renderProgress();
            saveData();
        });
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

function checkDayCompletion() {
    const allDone = progress[today].every(done => done);
    // The day completion is implicit in progress, but we don't need to store extra, since we check every time.
    renderProgress();
}

function renderProgress() {
    const grid = document.getElementById('days-grid');
    grid.innerHTML = '';
    const dates = [];
    for (let i = 59; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    dates.forEach((date, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = 60 - index;
        if (progress[date] && progress[date].length === goals.length && goals.length > 0 && progress[date].every(done => done)) {
            dayDiv.classList.add('completed');
        }
        grid.appendChild(dayDiv);
    });
    // Calculate streak
    let streak = 0;
    if (progress[today] && progress[today].length === goals.length && goals.length > 0 && progress[today].every(done => done)) {
        streak = 1;
        let d = new Date(today);
        while (true) {
            d.setDate(d.getDate() - 1);
            const prevDay = d.toISOString().split('T')[0];
            if (progress[prevDay] && progress[prevDay].length === goals.length && goals.length > 0 && progress[prevDay].every(done => done)) {
                streak++;
            } else {
                break;
            }
        }
    }
    document.getElementById('streak').textContent = streak;
}

document.getElementById('add-goal').addEventListener('click', () => {
    const input = document.getElementById('new-goal');
    const newGoal = input.value.trim();
    if (newGoal) {
        goals.push(newGoal);
        Object.keys(progress).forEach(date => {
            progress[date].push(false);
        });
        input.value = '';
        renderGoals();
        renderProgress();
        saveData();
    }
});

renderGoals();
renderProgress();