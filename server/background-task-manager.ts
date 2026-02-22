// background-task-manager.ts
// Optimized for Render Free Tier (750h limit)
// Tasks run only when triggered and stop immediately after completion.

import { EventEmitter } from 'events';

class BackgroundTaskManager extends EventEmitter {
    private tasks: Map<string, NodeJS.Timeout> = new Map();

    constructor() {
        super();
        this.on('startTask', this.startTask);
        this.on('stopTask', this.stopTask);
    }

    /**
     * Starts a background task that auto-terminates.
     * @param taskName Unique name for the task
     * @param duration Max duration in ms before auto-stop
     * @param taskFn The actual work to perform
     */
    async startTask(taskName: string, duration: number, taskFn: () => Promise<void>) {
        if (this.tasks.has(taskName)) {
            console.log(`[TaskManager] Task "${taskName}" is already active.`);
            return;
        }

        console.log(`[TaskManager] Starting task: ${taskName}`);
        
        // Set an absolute safety timeout to ensure it stops
        const timeout = setTimeout(() => {
            console.log(`[TaskManager] Task "${taskName}" reached safety timeout. Force stopping.`);
            this.stopTask(taskName);
        }, duration);

        this.tasks.set(taskName, timeout);

        try {
            await taskFn();
            console.log(`[TaskManager] Task "${taskName}" completed successfully.`);
        } catch (error) {
            console.error(`[TaskManager] Task "${taskName}" failed:`, error);
        } finally {
            this.stopTask(taskName);
        }
    }

    stopTask(taskName: string) {
        const timeout = this.tasks.get(taskName);
        if (timeout) {
            clearTimeout(timeout);
            this.tasks.delete(taskName);
            console.log(`[TaskManager] Task "${taskName}" has been stopped.`);
        }
    }

    // Check if any tasks are running
    hasActiveTasks(): boolean {
        return this.tasks.size > 0;
    }
}

export const taskManager = new BackgroundTaskManager();
