import { EventEmitter } from 'events';

class BackgroundTaskManager extends EventEmitter {
    private tasks: { [key: string]: NodeJS.Timeout } = {};

    constructor() {
        super();
        this.on('startTask', this.startTask);
        this.on('stopTask', this.stopTask);
    }

    // Method to start a new background task
    // It runs for a specific duration and then stops.
    // This prevents continuous background execution on Render Free Tier.
    startTask(taskName: string, duration: number, callback?: () => void) {
        if (this.tasks[taskName]) {
            console.log(`Task ${taskName} is already running.`);
            return;
        }
        console.log(`Starting task: ${taskName}`);
        
        // Execute the task logic if provided
        if (callback) {
            try {
                callback();
            } catch (err) {
                console.error(`Error executing task ${taskName}:`, err);
            }
        }

        this.tasks[taskName] = setTimeout(() => {
            console.log(`Task ${taskName} completed and auto-stopped.`);
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
