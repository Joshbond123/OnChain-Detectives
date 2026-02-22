import { EventEmitter } from 'events';

class BackgroundTaskManager extends EventEmitter {
    private tasks: { [key: string]: NodeJS.Timeout } = {};

    constructor() {
        super();
        this.on('startTask', this.startTask);
        this.on('stopTask', this.stopTask);
    }

    // Method to start a new background task
    startTask(taskName: string, duration: number) {
        if (this.tasks[taskName]) {
            console.log(`Task ${taskName} is already running.`);
            return;
        }
        console.log(`Starting task: ${taskName}`);
        this.tasks[taskName] = setTimeout(() => {
            console.log(`Task ${taskName} completed.`);
            this.stopTask(taskName);
        }, duration);
    }

    // Method to stop a specified background task
    stopTask(taskName: string) {
        if (this.tasks[taskName]) {
            clearTimeout(this.tasks[taskName]);
            delete this.tasks[taskName];
            console.log(`Task ${taskName} stopped.`);
        }
    }
}

export const taskManager = new BackgroundTaskManager();
