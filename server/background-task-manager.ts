// background-task-manager.ts

// Event-driven background tasks with automatic shutdown to optimize Render Free Tier usage

const EventEmitter = require('events');

class BackgroundTaskManager extends EventEmitter {
    // Store references to active tasks 
    private tasks: { [key: string]: NodeJS.Timeout } = {};

    constructor() {
        super();
        this.on('startTask', this.startTask);
        this.on('stopTask', this.stopTask);
        this.on('shutdown', this.shutdown);
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

    // Method to automatically shut down tasks if usage is low
    shutdown() {
        console.log('Shutting down all tasks due to low usage.');
        Object.keys(this.tasks).forEach(taskName => this.stopTask(taskName));
        console.log('All tasks have been shut down.');
    }
}

// Example usage
const manager = new BackgroundTaskManager();
manager.startTask('exampleTask', 5000); // Start a task that lasts 5 seconds

// Simulating usage condition that leads to shutdown
setTimeout(() => manager.shutdown(), 10000); // Shutdown after 10 seconds
