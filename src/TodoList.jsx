import React, {useState, useEffect} from 'react'
import styles from './TodoList.module.css'

function TodoList(){

    useEffect(() => {
        document.title = "Online To-Do List";
    }, []);

    const[tasks, setTasks] = useState(() => {
        const data = window.localStorage.getItem('todolistitems');
        if(data !== null) return JSON.parse(data);
        return [];
    });

    const[newTask, setNewTask] = useState('');
    const[newTaskDate, setNewTaskDate] = useState('');
    const[newTaskPriority, setNewTaskPriority] = useState('normal');
    const[newTaskType, setNewTaskType] = useState('General');
    const[filter, setFilter] = useState('all');
    const[priorityFilter, setPriorityFilter] = useState('all');
    const[dueFilter, setDueFilter] = useState('all');
    const[viewMode, setViewMode] = useState('list');
    const[calendarColorMode, setCalendarColorMode] = useState('type');
    const[calendarMonth, setCalendarMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    useEffect(() => {
        const data = window.localStorage.getItem('todolistitems');
        if(data !== null) setTasks(JSON.parse(data));
    }, []);

    useEffect(() => {
        window.localStorage.setItem('todolistitems', JSON.stringify(tasks))
    }, [tasks]);   
    ;

    function handleEnter(event){
        if(event.key === 'Enter'){
            addTask()
        }
    }

    function handleInputChange(event){
        setNewTask(event.target.value);
    }

    function handleDateChange(event){
        setNewTaskDate(event.target.value);
    }

    function handlePriorityChange(event){
        setNewTaskPriority(event.target.value);
    }

    function handleTypeChange(event){
        setNewTaskType(event.target.value);
    }

    function clearBox(){
        setNewTask('');
        setNewTaskDate('');
        setNewTaskPriority('normal');
        setNewTaskType('General');
    }

    function empty(){
        setTasks([]);
        setNewTask('');
    }

    function clearCompleted(){
        setTasks(t => t.filter(task => !task.isChecked));
    }

    function toggleAll(){
        const allDone = tasks.length > 0 && tasks.every(task => task.isChecked);
        setTasks(t => t.map(task => ({...task, isChecked: !allDone})));
    }

    function addTask(){

        if(newTask.trim() !== ""){
            setTasks(t => [{text: newTask.charAt(0).toUpperCase() + newTask.slice(1), isChecked: false, dueDate: newTaskDate, priority: newTaskPriority, type: newTaskType, createdAt: Date.now()}, ...t]);
            setNewTask('');
            setNewTaskDate('');
            setNewTaskPriority('normal');
            setNewTaskType('General');
        }
    }

    function deleteTask(index){
        setTasks(t => t.filter((task, i) => i != index));
    }

    function moveTaskUp(index){

        if(index > 0){
            const updatedList = [...tasks];
            [updatedList[index], updatedList[index-1]] = 
            [updatedList[index-1], updatedList[index]];
            setTasks(updatedList);
        }
    }

    function moveTaskDown(index){

        if(index < tasks.length - 1){
            const updatedList = [...tasks];
            [updatedList[index], updatedList[index+1]] = 
            [updatedList[index+1], updatedList[index]];
            setTasks(updatedList);
        }
    }

    function checkItem(index){
       
        let tempIndex = 0;
        
        let updatedList = tasks.map((task, i) => 
            i === index ? {...task, isChecked: !task.isChecked } : task );

        let temp = updatedList[index];

        if(!tasks[index].isChecked){

            for(let i = index; i < tasks.length; i++){
                updatedList[i] = updatedList[i+1];
            }

            updatedList[tasks.length-1] = temp;

        }
        if(tasks[index].isChecked){
            for(let i = 0; i < tasks.length; i++){
                if(tasks[i].isChecked){
                    tempIndex = i;
                    break;
                }
            }
            
            for(let i = index; i > tempIndex; i--){
                updatedList[i] = updatedList[i-1];
            } 

            updatedList[tempIndex] = temp;
        }
        

        setTasks(updatedList); 
    }

    const completedCount = tasks.filter(task => task.isChecked).length;
    const remainingCount = tasks.length - completedCount;
    const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

    const tasksWithIndex = tasks.map((task, index) => ({task, index}));

    const filteredEntries = tasksWithIndex.filter(({task}) => {
        const priority = task.priority || 'normal';
        if(filter === 'active' && task.isChecked) return false;
        if(filter === 'done' && !task.isChecked) return false;
        if(priorityFilter !== 'all' && priority !== priorityFilter) return false;
        if(dueFilter === 'dated' && !task.dueDate) return false;
        if(dueFilter === 'general' && task.dueDate) return false;
        return true;
    });

    function parseDueDate(value){
        if(!value) return null;
        return new Date(`${value}T00:00:00`);
    }

    function formatDueDate(value){
        const date = parseDueDate(value);
        if(!date) return '';
        return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
    }

    function getDueLabel(value){
        const date = parseDueDate(value);
        if(!date) return 'No date';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24));
        if(diffDays < 0){
            const days = Math.abs(diffDays);
            return days === 1 ? 'Overdue by 1 day' : `Overdue by ${days} days`;
        }
        if(diffDays === 0) return 'Due today';
        if(diffDays === 1) return 'Due tomorrow';
        if(diffDays <= 7) return `Due in ${diffDays} days`;
        return `Due ${formatDueDate(value)}`;
    }

    function getDueBucket(value){
        if(!value) return 'none';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = parseDueDate(value);
        const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
        if(diffDays < 0) return 'overdue';
        if(diffDays === 0) return 'today';
        if(diffDays <= 3) return 'soon';
        if(diffDays <= 7) return 'week';
        return 'later';
    }

    function getMonthLabel(date){
        return date.toLocaleDateString(undefined, {month: 'long', year: 'numeric'});
    }

    function shiftMonth(direction){
        setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    }

    function getDateKey(date){
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function buildCalendarDays(date){
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for(let i = 0; i < startOffset; i++){
            days.push(null);
        }
        for(let day = 1; day <= daysInMonth; day++){
            days.push(new Date(year, month, day));
        }
        const remainder = (7 - (days.length % 7)) % 7;
        for(let i = 0; i < remainder; i++){
            days.push(null);
        }
        return days;
    }

    const sections = [
        {id: 'overdue', label: 'Overdue'},
        {id: 'today', label: 'Due Today'},
        {id: 'soon', label: 'Due Soon (3 Days)'},
        {id: 'week', label: 'Due Within 7 Days'},
        {id: 'later', label: 'Later'},
        {id: 'none', label: 'No Due Date'}
    ];

    const groupedTasks = sections.map(section => {
        const items = filteredEntries
            .filter(({task}) => getDueBucket(task.dueDate) === section.id)
            .sort((a, b) => {
                if(section.id === 'none') return a.index - b.index;
                const dateA = parseDueDate(a.task.dueDate)?.getTime() ?? 0;
                const dateB = parseDueDate(b.task.dueDate)?.getTime() ?? 0;
                if(dateA === dateB) return a.index - b.index;
                return dateA - dateB;
            });
        return {...section, items};
    });

    const calendarDays = buildCalendarDays(calendarMonth);
    const dueEntriesByDate = filteredEntries.reduce((acc, entry) => {
        if(entry.task.dueDate){
            if(!acc[entry.task.dueDate]) acc[entry.task.dueDate] = [];
            acc[entry.task.dueDate].push(entry);
        }
        return acc;
    }, {});
    const noDateEntries = filteredEntries.filter(({task}) => !task.dueDate);
    const todayKey = getDateKey(new Date());

    return(
        <>
            <div className={styles.todoList}>
                <div className={styles.shell}>
                    <div className={styles.headerBar}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>To-Do List</h1>
                            <p className={styles.tagline}>Quiet structure for ambitious days.</p>
                        </div>
                        <div className={styles.stats}>
                            <div className={styles.counts}>
                                <span className={styles.countItem}>Total <strong>{tasks.length}</strong></span>
                                <span className={styles.countItem}>Open <strong>{remainingCount}</strong></span>
                                <span className={styles.countItem}>Done <strong>{completedCount}</strong></span>
                            </div>
                            <div className={styles.progressTrack} aria-hidden="true">
                                <div className={styles.progressFill} style={{width: `${progress}%`}}></div>
                            </div>
                        </div>
                        <div className={styles.inputField}>
                            <input className={styles.input}
                                type='text'
                                placeholder="Enter a task..."
                                value={newTask}
                                onChange={handleInputChange}
                                onKeyDown={handleEnter}
                            ></input>
                            <input className={styles.dateInput}
                                type='date'
                                value={newTaskDate}
                                onChange={handleDateChange}
                            ></input>
                            <select className={styles.selectInput}
                                value={newTaskPriority}
                                onChange={handlePriorityChange}>
                                <option value="low">Low priority</option>
                                <option value="normal">Normal priority</option>
                                <option value="high">High priority</option>
                            </select>
                            <select className={styles.selectInput}
                                value={newTaskType}
                                onChange={handleTypeChange}>
                                <option value="General">General</option>
                                <option value="Work">Work</option>
                                <option value="Personal">Personal</option>
                                <option value="Health">Health</option>
                                <option value="Study">Study</option>
                                <option value="Errands">Errands</option>
                            </select>
                            <button className={styles.add}
                                    onClick={addTask}>
                            Add</button>
                            <button className={styles.clear}
                                    onClick={clearBox}>
                            Clear</button>
                            <button className={styles.empty}
                                    onClick={empty}>
                            Clear All</button>
                        </div>
                        <div className={styles.actionRow}>
                            <button className={styles.toggleAll}
                                    onClick={toggleAll}
                                    disabled={tasks.length === 0}>
                                {tasks.length > 0 && tasks.every(task => task.isChecked) ? 'Mark All Open' : 'Mark All Done'}
                            </button>
                            <button className={styles.clearCompleted}
                                    onClick={clearCompleted}
                                    disabled={completedCount === 0}>
                                Clear Completed
                            </button>
                        </div>
                        <div className={styles.filters}>
                            <button className={filter === 'all' ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                                    onClick={() => setFilter('all')}>
                                All
                            </button>
                            <button className={filter === 'active' ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                                    onClick={() => setFilter('active')}>
                                Active
                            </button>
                            <button className={filter === 'done' ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                                    onClick={() => setFilter('done')}>
                                Done
                            </button>
                        </div>
                        <div className={styles.filters}>
                            <button className={priorityFilter === 'all' ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                                    onClick={() => setPriorityFilter('all')}>
                                All priorities
                            </button>
                            <button className={priorityFilter === 'high' ? `${styles.filter} ${styles.filterActive} ${styles.filterHigh}` : `${styles.filter} ${styles.filterHigh}`}
                                    onClick={() => setPriorityFilter('high')}>
                                <span className={styles.filterDot}></span>
                                High
                            </button>
                            <button className={priorityFilter === 'normal' ? `${styles.filter} ${styles.filterActive} ${styles.filterNormal}` : `${styles.filter} ${styles.filterNormal}`}
                                    onClick={() => setPriorityFilter('normal')}>
                                <span className={styles.filterDot}></span>
                                Normal
                            </button>
                            <button className={priorityFilter === 'low' ? `${styles.filter} ${styles.filterActive} ${styles.filterLow}` : `${styles.filter} ${styles.filterLow}`}
                                    onClick={() => setPriorityFilter('low')}>
                                <span className={styles.filterDot}></span>
                                Low
                            </button>
                        </div>
                        <div className={styles.filters}>
                            <button className={dueFilter === 'all' ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                                    onClick={() => setDueFilter('all')}>
                                All tasks
                            </button>
                            <button className={dueFilter === 'dated' ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                                    onClick={() => setDueFilter('dated')}>
                                With due date
                            </button>
                            <button className={dueFilter === 'general' ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                                    onClick={() => setDueFilter('general')}>
                                General (no date)
                            </button>
                        </div>
                        <div className={styles.viewTabs}>
                            <button className={viewMode === 'list' ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab}
                                    onClick={() => setViewMode('list')}>
                                List view
                            </button>
                            <button className={viewMode === 'calendar' ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab}
                                    onClick={() => setViewMode('calendar')}>
                                Calendar view
                            </button>
                        </div>
                    </div>  
                    <div className={styles.listSection}>
                        {viewMode === 'list' ? (
                            filteredEntries.length === 0 ? (
                            <div className={styles.emptyState}>
                                {tasks.length === 0 ? 'Nothing here yet. Add a first task.' : 'No tasks in this view.'}
                            </div>
                        ) : (
                            <div className={styles.sections}>
                                {groupedTasks.map(section => (
                                    section.items.length > 0 ? (
                                        <div key={section.id} className={styles.section}>
                                            <div className={styles.sectionHeader}>
                                                <span>{section.label}</span>
                                                <span className={styles.sectionCount}>{section.items.length}</span>
                                            </div>
                                            <ul className={styles.unordered}>
                                                {section.items.map(({task, index}) => (
                                                <li key={`${section.id}-${index}`} className={task.isChecked ? `${styles.listItem} ${styles.listItemCompleted}` : styles.listItem}>
                                                    <input type="checkbox" name="complete" checked={task.isChecked} onChange={() => checkItem(index)} className={styles.check}></input>
                                                    <div className={styles.textBlock}>
                                                        <span className={task.dueDate ? styles.dueAbove : styles.dueAboveMuted}>
                                                            {getDueLabel(task.dueDate)}
                                                        </span>
                                                        <span className={styles.text}>{task.text}</span>
                                                    </div>
                                                    <div className={styles.meta}>
                                                        <span className={`${styles.typeBadge} ${styles[`type${(task.type || 'General').replace(/\s+/g, '')}`]}`}>
                                                            {task.type || 'General'}
                                                        </span>
                                                        <span className={`${styles.priorityBadge} ${styles[`priority${(task.priority || 'normal').charAt(0).toUpperCase()}${(task.priority || 'normal').slice(1)}`]}`}>
                                                            <span className={styles.priorityDot}></span>
                                                            {(task.priority || 'normal')} priority
                                                        </span>
                                                    </div>
                                                    <div className={styles.actionGroup}>
                                                        <button className={styles.delete}
                                                                onClick={() => deleteTask(index)}>
                                                            Delete
                                                        </button>
                                                        <div className={styles.moveStack}>
                                                            <button className={styles.up}
                                                                    onClick={() => moveTaskUp(index)}
                                                                    aria-label="Move task up">
                                                                ▲
                                                            </button>
                                                            <button className={styles.down}
                                                                    onClick={() => moveTaskDown(index)}
                                                                    aria-label="Move task down">
                                                                ▼
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>))}
                                            </ul>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        )
                        ) : (
                            <div className={styles.calendar}>
                                <div className={styles.calendarHeader}>
                                    <button className={styles.calendarNav} onClick={() => shiftMonth(-1)}>Prev</button>
                                    <span className={styles.calendarTitle}>{getMonthLabel(calendarMonth)}</span>
                                    <button className={styles.calendarNav} onClick={() => shiftMonth(1)}>Next</button>
                                </div>
                                <div className={styles.calendarControls}>
                                    <span className={styles.calendarControlLabel}>Color by</span>
                                    <button className={calendarColorMode === 'type' ? `${styles.calendarControl} ${styles.calendarControlActive}` : styles.calendarControl}
                                            onClick={() => setCalendarColorMode('type')}>
                                        Type
                                    </button>
                                    <button className={calendarColorMode === 'priority' ? `${styles.calendarControl} ${styles.calendarControlActive}` : styles.calendarControl}
                                            onClick={() => setCalendarColorMode('priority')}>
                                        Priority
                                    </button>
                                </div>
                                <div className={styles.calendarGrid}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className={styles.calendarWeekday}>{day}</div>
                                    ))}
                                    {calendarDays.map((day, index) => {
                                        if(!day){
                                            return <div key={`empty-${index}`} className={styles.calendarCell}></div>;
                                        }
                                        const dateKey = getDateKey(day);
                                        const items = dueEntriesByDate[dateKey] || [];
                                        const isToday = dateKey === todayKey;
                                        return (
                                            <div key={dateKey} className={isToday ? `${styles.calendarCell} ${styles.calendarToday}` : styles.calendarCell}>
                                                <span className={styles.calendarDay}>{day.getDate()}</span>
                                                <div className={styles.calendarTasks}>
                                                    {items.slice(0, 3).map((entry, taskIndex) => (
                                                        <button
                                                            key={`${dateKey}-${taskIndex}`}
                                                            type="button"
                                                            onClick={() => {
                                                                checkItem(entry.index);
                                                            }}
                                                            className={
                                                                `${styles.calendarTask} ${entry.task.isChecked ? styles.calendarTaskDone : ''} ` +
                                                                (calendarColorMode === 'priority'
                                                                    ? `${styles[`priority${(entry.task.priority || 'normal').charAt(0).toUpperCase()}${(entry.task.priority || 'normal').slice(1)}`]}`
                                                                    : `${styles[`type${(entry.task.type || 'General').replace(/\s+/g, '')}`]}`)
                                                            }>
                                                            {entry.task.text}
                                                        </button>
                                                    ))}
                                                    {items.length > 3 ? (
                                                        <div className={styles.calendarMore}>+{items.length - 3} more</div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {noDateEntries.length > 0 ? (
                                    <div className={styles.calendarAside}>
                                        <div className={styles.sectionHeader}>
                                            <span>General tasks</span>
                                            <span className={styles.sectionCount}>{noDateEntries.length}</span>
                                        </div>
                                        <div className={styles.calendarNoDate}>
                                            {noDateEntries.map(({task, index}) => (
                                                <button
                                                    key={`nodate-${index}`}
                                                    type="button"
                                                    className={task.isChecked ? `${styles.calendarNoDateItem} ${styles.calendarNoDateDone}` : styles.calendarNoDateItem}
                                                    onClick={() => {
                                                        checkItem(index);
                                                    }}>
                                                    <span className={styles.calendarNoDateText}>{task.text}</span>
                                                    <div className={styles.calendarNoDateMeta}>
                                                        <span className={`${styles.typeBadge} ${styles[`type${(task.type || 'General').replace(/\s+/g, '')}`]}`}>
                                                            {task.type || 'General'}
                                                        </span>
                                                        <span className={`${styles.priorityBadge} ${styles[`priority${(task.priority || 'normal').charAt(0).toUpperCase()}${(task.priority || 'normal').slice(1)}`]}`}>
                                                            <span className={styles.priorityDot}></span>
                                                            {(task.priority || 'normal')} priority
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default TodoList
