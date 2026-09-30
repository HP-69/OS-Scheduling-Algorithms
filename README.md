[README.md](https://github.com/user-attachments/files/32865973/README.md)
<div align="center">

# CPU Scheduling Simulator

**An interactive web tool that simulates classic CPU scheduling algorithms and draws the Gantt chart for you.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![No dependencies](https://img.shields.io/badge/dependencies-none-2f7d4f?style=flat)
![Hosted on GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-222?style=flat&logo=github)

[**Live demo**](https://YOUR-USERNAME.github.io/cpu-scheduler/) &nbsp;|&nbsp; [Features](#features) &nbsp;|&nbsp; [Algorithms](#supported-algorithms) &nbsp;|&nbsp; [How to run](#getting-started) &nbsp;|&nbsp; [Worked example](#worked-example)

</div>

---

## Table of Contents

1. [About the project](#about-the-project)
2. [Features](#features)
3. [Supported algorithms](#supported-algorithms)
4. [How to use it](#how-to-use-it)
5. [Metrics and formulas](#metrics-and-formulas)
6. [Simulation rules and assumptions](#simulation-rules-and-assumptions)
7. [Worked example](#worked-example)
8. [Project structure](#project-structure)
9. [Getting started](#getting-started)
10. [Deploying to GitHub Pages](#deploying-to-github-pages)
11. [Tech stack](#tech-stack)
12. [Author](#author)

---

## About the project

CPU scheduling decides which process gets the processor and for how long. It is one of the core topics of an Operating Systems course, and it is much easier to understand when you can see the schedule instead of only calculating it on paper.

This project is a small, dependency-free web app built for an Operating Systems lab. You enter a set of processes, choose an algorithm, and the simulator produces:

- a **Gantt chart** showing exactly when each process runs (including idle time and context switches),
- a **results table** with completion, turnaround, waiting and response time for every process,
- **summary statistics** such as averages, CPU utilization and throughput.

Everything runs in the browser. There is no server, no build step and nothing to install.

---

## Features

| Feature | Description |
| --- | --- |
| **Five scheduling families** | FCFS, SJF, SRTN, Round Robin and Priority (both preemptive and non-preemptive) |
| **Dynamic process input** | Add any number of processes with arrival time, burst time and priority |
| **Editable process table** | Change arrival, burst or priority values directly in the table after adding a process |
| **Optional priority** | A "Use priority" checkbox shows or hides the priority field, column and priority algorithms |
| **Context switch overhead** | Tick "Count context switch time" and set how many time units a switch costs |
| **Gantt chart** | Colour-coded blocks with time markers, plus separate blocks for idle CPU time and context switches |
| **Full metrics** | Completion, turnaround, waiting and response time for each process |
| **Summary statistics** | Average times, CPU utilization, throughput, number of context switches and time lost to switching |
| **Input validation** | Clear messages for invalid values such as a burst time below 1 |
| **Sample data** | One click loads a ready-made set of five processes |
| **Responsive layout** | Tables and the Gantt chart scroll horizontally on small screens |

---

## Supported algorithms

| Algorithm | Type | Selection rule |
| --- | --- | --- |
| **First Come First Serve (FCFS)** | Non-preemptive | The process that arrived first runs first |
| **Shortest Job First (SJF)** | Non-preemptive | The ready process with the smallest burst time runs to completion |
| **Shortest Remaining Time Next (SRTN)** | Preemptive | The ready process with the least remaining time always runs |
| **Round Robin (RR)** | Preemptive | Processes take turns in a queue, each for at most one time quantum |
| **Non-Preemptive Priority** | Non-preemptive | The ready process with the highest priority runs to completion |
| **Preemptive Priority** | Preemptive | The highest-priority ready process always runs, and it can interrupt a running one |

> **Priority convention:** a lower number means a higher priority (1 is the highest).

---

## How to use it

### Step 1: Add processes

1. Optionally tick **Use priority** if your problem includes priorities.
2. Enter the **arrival time**, **burst time** and (if enabled) **priority**.
3. Click **Add process**. Process names (P1, P2, ...) are assigned automatically.
4. To fix a mistake, edit any value directly in the table. Use **Remove** to delete a process, **Clear all** to start over, or **Load sample data** to try the tool quickly.

### Step 2: Choose an algorithm

1. Pick an algorithm from the dropdown. A short description appears under it.
2. For Round Robin, enter the **time quantum**.
3. Optionally tick **Count context switch time** and enter how long one switch takes.
4. Click **Run simulation**.

### Step 3: Read the output

The output section shows the Gantt chart, the per-process results table and the summary cards. Editing any process value hides the old output, because it no longer matches the data. Run the simulation again to refresh it.

| Input | Rule |
| --- | --- |
| Arrival time | Whole number, 0 or more |
| Burst time | Whole number, 1 or more |
| Priority | Whole number, 1 or more |
| Time quantum | Whole number, 1 or more |
| Context switch time | Whole number, 1 or more |

---

## Metrics and formulas

| Metric | Formula |
| --- | --- |
| **Completion time (CT)** | The time at which the process finishes |
| **Turnaround time (TAT)** | CT - Arrival time |
| **Waiting time (WT)** | TAT - Burst time |
| **Response time (RT)** | Time of first CPU allocation - Arrival time |
| **CPU utilization** | Total burst time / Total elapsed time x 100 |
| **Throughput** | Number of processes / Total elapsed time |

When context switching is enabled, switch time is part of the elapsed time. It therefore increases completion, turnaround, waiting and response times, and it lowers CPU utilization.

---

## Simulation rules and assumptions

These rules decide the result whenever there is more than one valid choice, so it helps to know them when you compare the output with a hand-solved answer.

- **Tie-breaking:** if two ready processes have the same selection value (for example, equal burst time), the one with the **earlier arrival time** goes first. If that is also equal, the one added first goes first.
- **Preemptive algorithms** (SRTN and Preemptive Priority) re-check the ready set after every time unit, so a newly arrived process can take the CPU immediately.
- **Round Robin queue order:** a process that arrives while another is running joins the queue *before* the preempted process is placed at the back.
- **Idle time:** if no process has arrived yet, the CPU sits idle. This is shown as a white **Idle** block on the Gantt chart.
- **Context switches** are charged only when the CPU moves **directly from one process to a different one**. No switch is charged at the very start, after an idle gap, or when the same process keeps running.
- **Committing to a switch:** once a context switch begins, the CPU commits to the process chosen at that moment. A process that arrives during the switch is only considered afterwards.
- **Time is measured in whole units.** Fractional values are not supported.

---

## Worked example

The **Load sample data** button fills in this set of processes.

| Process | Arrival | Burst | Priority |
| --- | --- | --- | --- |
| P1 | 0 | 5 | 2 |
| P2 | 1 | 3 | 1 |
| P3 | 2 | 8 | 4 |
| P4 | 3 | 6 | 3 |
| P5 | 4 | 2 | 5 |

Results for two of the algorithms (no context switch time):

| Algorithm | Gantt order | Avg turnaround | Avg waiting |
| --- | --- | --- | --- |
| **FCFS** | P1 (0-5), P2 (5-8), P3 (8-16), P4 (16-22), P5 (22-24) | 13.00 | 8.20 |
| **SJF** | P1 (0-5), P5 (5-7), P2 (7-10), P4 (10-16), P3 (16-24) | 10.40 | 5.60 |

SJF gives a lower average waiting time here because the short jobs (P5 and P2) no longer wait behind the long ones. You can use these values to check that the simulator matches your own calculations.

---

## Project structure

```text
cpu-scheduler/
├── index.html     # Page structure: forms, tables, Gantt container
├── style.css      # All styling (colours, layout, fonts, Gantt blocks)
├── script.js      # Scheduling algorithms, metrics and rendering
└── README.md      # Project documentation
```

**Inside `script.js`:**

| Section | Purpose |
| --- | --- |
| Input handling | Adding, editing, removing and validating processes |
| `nonPreemptive()` | Shared engine for FCFS, SJF and Non-Preemptive Priority |
| `preemptive()` | Shared engine for SRTN and Preemptive Priority |
| `roundRobin()` | Queue-based Round Robin |
| `withCS()` | Inserts a context-switch block when the CPU changes process |
| `computeMetrics()` | Calculates CT, TAT, WT and RT |
| `renderGantt()` / `renderResults()` | Draws the chart, table and summary cards |

---

## Getting started

No installation is needed. Choose whichever option suits you.

**Option 1: open the file directly**

1. Download or clone the repository.
2. Double-click `index.html`. It opens in any modern browser.

**Option 2: VS Code Live Server**

1. Install the *Live Server* extension.
2. Right-click `index.html` and choose **Open with Live Server**.

**Option 3: a local web server with Python**

```bash
git clone https://github.com/YOUR-USERNAME/cpu-scheduler.git
cd cpu-scheduler
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

> The page uses Google Fonts (Poppins and Nunito). If you are offline, it falls back to system fonts and still works.

---

## Deploying to GitHub Pages

1. Push the project to a public GitHub repository, with `index.html` in the root folder.
2. Open the repository's **Settings**, then **Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/cpu-scheduler/`.

File names are case-sensitive on GitHub, so keep `style.css` and `script.js` exactly as they are.

---

## Tech stack

- **HTML5** for the structure
- **CSS3** for layout and styling (flexbox, no framework)
- **Vanilla JavaScript (ES6)** for the algorithms and rendering
- **Google Fonts:** Poppins (headings) and Nunito (body text)

There are no libraries, frameworks or build tools.

---

## Author

**Your Name** (Roll No. XXXXX)
Operating Systems Lab

Replace the placeholders above and in the live demo link with your own details before submitting.
