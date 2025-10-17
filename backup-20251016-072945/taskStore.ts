import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TaskUpdate, Priority, TaskStatus, SubTask, DelegationHistory, TaskReadStatus } from "../types/buildtrack";

// Helper function to determine status based on completion percentage
const getStatusFromCompletion = (completionPercentage: number): TaskStatus => {
  if (completionPercentage === 0) return "not_started";
  if (completionPercentage === 100) return "completed";
  return "in_progress";
};

// Mock data for development
const MOCK_TASKS: Task[] = [
  {
    id: "1",
    projectId: "proj-1", // Assign to Downtown Office Complex
    title: "Fix Roof Leak in Building A",
    description: "Urgent repair needed for roof leak in the east wing of Building A. Water is damaging interior walls.",
    priority: "critical",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "structural",
    attachments: [],
    assignedTo: ["2"],
    assignedBy: "1",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "1",
  },
  {
    id: "2",
    projectId: "proj-1", // Assign to Downtown Office Complex
    title: "Electrical Safety Inspection",
    description: "Monthly safety inspection of electrical systems in all buildings.",
    priority: "high",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "safety",
    attachments: [],
    assignedTo: ["2"],
    assignedBy: "1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [
      {
        id: "update-1",
        description: "Started inspection of Building A electrical systems",
        photos: [],
        completionPercentage: 25,
        status: "in_progress",
        timestamp: new Date().toISOString(),
        userId: "2",
      }
    ],
    currentStatus: "in_progress",
    completionPercentage: 25,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "1",
  },
  {
    id: "3",
    projectId: "proj-1", // Downtown Office Complex
    title: "Install Safety Barriers on 5th Floor",
    description: "Install temporary safety barriers around construction zone on 5th floor to prevent accidents.",
    priority: "high",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "safety",
    attachments: [],
    assignedTo: ["6"], // Dennis
    assignedBy: "1",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "1",
  },
  {
    id: "4",
    projectId: "proj-2", // Residential Housing Development
    title: "Inspect Foundation Pouring Quality",
    description: "Perform quality inspection on foundations for units 20-30. Check for cracks and proper curing.",
    priority: "medium",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "structural",
    attachments: [],
    assignedTo: ["6"], // Dennis
    assignedBy: "1",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "1",
  },
  {
    id: "5",
    projectId: "proj-2", // Residential Housing Development
    title: "Coordinate Plumbing Subcontractor Schedule",
    description: "Meet with plumbing team to finalize installation schedule for units 1-15.",
    priority: "high",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "plumbing",
    attachments: [],
    assignedTo: ["6"], // Dennis
    assignedBy: "1",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "1",
  },
  {
    id: "6",
    projectId: "proj-1", // Downtown Office Complex
    title: "Review Construction Materials Quality",
    description: "Originally assigned to Sarah, but delegated to Dennis. Inspect quality of delivered construction materials for Building A.",
    priority: "high",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: "materials",
    attachments: [],
    assignedTo: ["6"], // Delegated to Dennis
    assignedBy: "2", // Sarah delegated it
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: undefined, // Needs to be accepted by Dennis
    delegationHistory: [
      {
        id: "del-1",
        fromUserId: "2", // Sarah
        toUserId: "6", // Dennis
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reason: "Dennis has more experience with material quality checks",
      }
    ],
    originalAssignedBy: "1", // Originally assigned by John Manager
  },
  {
    id: "7",
    projectId: "proj-1", // Downtown Office Complex
    title: "Project Status Review Meeting",
    description: "Conduct weekly project status review meeting with all stakeholders. Prepare agenda and coordinate with team leads.",
    priority: "high",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "general",
    attachments: [],
    assignedTo: ["1"], // Assigned to John Manager
    assignedBy: "3", // Assigned by Alex Admin
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "in_progress",
    completionPercentage: 30,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "3",
  },
  {
    id: "8",
    projectId: "proj-1", // Downtown Office Complex
    title: "Budget Analysis and Reporting",
    description: "Analyze current project budget status and prepare detailed financial report for client review.",
    priority: "medium",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "general",
    attachments: [],
    assignedTo: ["1"], // Assigned to John Manager
    assignedBy: "3", // Assigned by Alex Admin
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: undefined, // Needs to be accepted by John Manager
    delegationHistory: [],
    originalAssignedBy: "3",
  },
];

interface TaskStore {
  tasks: Task[];
  taskReadStatuses: TaskReadStatus[];
  isLoading: boolean;
  
  // Task management
  createTask: (task: Omit<Task, "id" | "createdAt" | "updates" | "currentStatus" | "completionPercentage">) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Task assignment
  assignTask: (taskId: string, userIds: string[]) => void;
  acceptTask: (taskId: string, userId: string) => void;
  declineTask: (taskId: string, userId: string, reason: string) => void;
  
  // Task delegation
  delegateTask: (taskId: string, fromUserId: string, toUserId: string, reason?: string) => { success: boolean; error?: string };
  delegateSubTask: (taskId: string, subTaskId: string, fromUserId: string, toUserId: string, reason?: string) => { success: boolean; error?: string };
  checkDelegationLoop: (taskId: string, fromUserId: string, toUserId: string) => boolean;
  
  // Progress tracking
  addTaskUpdate: (taskId: string, update: Omit<TaskUpdate, "id" | "timestamp">) => void;
  addSubTaskUpdate: (taskId: string, subTaskId: string, update: Omit<TaskUpdate, "id" | "timestamp">) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, completionPercentage: number) => void;
  
  // Subtask management
  createSubTask: (taskId: string, subTask: Omit<SubTask, "id" | "createdAt" | "parentTaskId" | "currentStatus" | "completionPercentage">) => string;
  createNestedSubTask: (taskId: string, parentSubTaskId: string, subTask: Omit<SubTask, "id" | "createdAt" | "parentTaskId" | "currentStatus" | "completionPercentage">) => string;
  updateSubTask: (taskId: string, subTaskId: string, updates: Partial<SubTask>) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  updateSubTaskStatus: (taskId: string, subTaskId: string, status: TaskStatus, completionPercentage: number) => void;
  acceptSubTask: (taskId: string, subTaskId: string, userId: string) => void;
  declineSubTask: (taskId: string, subTaskId: string, userId: string, reason: string) => void;
  
  // Task read status management
  markTaskAsRead: (userId: string, taskId: string) => void;
  getUnreadTaskCount: (userId: string) => number;
  
  // Filtering and querying
  getTasksByUser: (userId: string, projectId?: string) => Task[];
  getTasksAssignedBy: (userId: string, projectId?: string) => Task[];
  getOverdueTasks: (projectId?: string) => Task[];
  getTasksByStatus: (status: TaskStatus, projectId?: string) => Task[];
  getTasksByPriority: (priority: Priority, projectId?: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: MOCK_TASKS,
      taskReadStatuses: [],
      isLoading: false,

      createTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
      updates: [],
      currentStatus: "not_started",
      completionPercentage: 0,
      delegationHistory: [],
      originalAssignedBy: taskData.assignedBy,
    };
        
        set(state => ({
          tasks: [...state.tasks, newTask]
        }));
        
        return newTask.id;
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, ...updates } : task
          )
        }));
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },

      assignTask: (taskId, userIds) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { ...task, assignedTo: userIds, accepted: undefined }
              : task
          )
        }));
      },

      acceptTask: (taskId, userId) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId && task.assignedTo.includes(userId)
              ? { ...task, accepted: true, declineReason: undefined }
              : task
          )
        }));
      },

      declineTask: (taskId, userId, reason) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId && task.assignedTo.includes(userId)
              ? { ...task, accepted: false, declineReason: reason }
              : task
          )
        }));
      },

      // Check if delegation would create a loop
      checkDelegationLoop: (taskId, fromUserId, toUserId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return false;

        // If there's no delegation history, no loop possible
        if (!task.delegationHistory || task.delegationHistory.length === 0) {
          return false;
        }

        // Check if toUserId has ever delegated this task
        // This prevents loops like: A -> B -> C -> A
        const delegationChain = task.delegationHistory.map(d => d.fromUserId);
        return delegationChain.includes(toUserId);
      },

      delegateTask: (taskId, fromUserId, toUserId, reason) => {
        // Check for delegation loop
        if (get().checkDelegationLoop(taskId, fromUserId, toUserId)) {
          return { 
            success: false, 
            error: "Cannot delegate: This would create a delegation loop. The user you're trying to delegate to has previously delegated this task." 
          };
        }

        const task = get().tasks.find(t => t.id === taskId);
        if (!task) {
          return { success: false, error: "Task not found" };
        }

        // Check if fromUserId is currently assigned to the task
        if (!task.assignedTo.includes(fromUserId)) {
          return { success: false, error: "You are not assigned to this task" };
        }

        // Create delegation record
        const delegation: DelegationHistory = {
          id: Date.now().toString(),
          fromUserId,
          toUserId,
          timestamp: new Date().toISOString(),
          reason,
        };

        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId
              ? { 
                  ...task, 
                  assignedTo: [toUserId], // Replace assignee
                  assignedBy: fromUserId, // Current delegator becomes assignedBy
                  delegationHistory: [...(task.delegationHistory || []), delegation],
                  originalAssignedBy: task.originalAssignedBy || task.assignedBy, // Preserve original creator
                  accepted: undefined, // New assignee needs to accept
                  declineReason: undefined,
                }
              : task
          )
        }));

        return { success: true };
      },

      delegateSubTask: (taskId, subTaskId, fromUserId, toUserId, reason) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) {
          return { success: false, error: "Task not found" };
        }

        const subTask = task.subTasks?.find(st => st.id === subTaskId);
        if (!subTask) {
          return { success: false, error: "Sub-task not found" };
        }

        // Check for delegation loop in subtask
        const delegationChain = subTask.delegationHistory?.map(d => d.fromUserId) || [];
        if (delegationChain.includes(toUserId)) {
          return { 
            success: false, 
            error: "Cannot delegate: This would create a delegation loop. The user you're trying to delegate to has previously delegated this sub-task." 
          };
        }

        // Check if fromUserId is currently assigned to the subtask
        if (!subTask.assignedTo.includes(fromUserId)) {
          return { success: false, error: "You are not assigned to this sub-task" };
        }

        // Create delegation record
        const delegation: DelegationHistory = {
          id: Date.now().toString(),
          fromUserId,
          toUserId,
          timestamp: new Date().toISOString(),
          reason,
        };

        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId
              ? {
                  ...task,
                  subTasks: (task.subTasks || []).map(subTask =>
                    subTask.id === subTaskId
                      ? { 
                          ...subTask, 
                          assignedTo: [toUserId],
                          assignedBy: fromUserId,
                          delegationHistory: [...(subTask.delegationHistory || []), delegation],
                          originalAssignedBy: subTask.originalAssignedBy || subTask.assignedBy,
                          accepted: undefined,
                          declineReason: undefined,
                        }
                      : subTask
                  )
                }
              : task
          )
        }));

        return { success: true };
      },

      addTaskUpdate: (taskId, updateData) => {
        const newUpdate: TaskUpdate = {
          ...updateData,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        // Determine status based on completion percentage
        const autoStatus = getStatusFromCompletion(updateData.completionPercentage);
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  updates: [...task.updates, newUpdate],
                  currentStatus: autoStatus,
                  completionPercentage: updateData.completionPercentage,
                }
              : task
          )
        }));
      },

      addSubTaskUpdate: (taskId, subTaskId, updateData) => {
        const newUpdate: TaskUpdate = {
          ...updateData,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        // Determine status based on completion percentage
        const autoStatus = getStatusFromCompletion(updateData.completionPercentage);
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  subTasks: (task.subTasks || []).map(subTask =>
                    subTask.id === subTaskId
                      ? {
                          ...subTask,
                          updates: [...(subTask.updates || []), newUpdate],
                          currentStatus: autoStatus,
                          completionPercentage: updateData.completionPercentage,
                        }
                      : subTask
                  )
                }
              : task
          )
        }));
      },

      updateTaskStatus: (taskId, status, completionPercentage) => {
        // Determine status based on completion percentage
        const autoStatus = getStatusFromCompletion(completionPercentage);
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { ...task, currentStatus: autoStatus, completionPercentage }
              : task
          )
        }));
      },

      createSubTask: (taskId, subTaskData) => {
        // Get parent task to inherit projectId
        const parentTask = get().tasks.find(t => t.id === taskId);
        
        const newSubTask: SubTask = {
          ...subTaskData,
          id: Date.now().toString(),
          parentTaskId: taskId,
          projectId: parentTask?.projectId || '',
          createdAt: new Date().toISOString(),
          updates: [],
          currentStatus: "not_started",
          completionPercentage: 0,
          attachments: subTaskData.attachments || [],
          location: subTaskData.location || undefined,
          subTasks: [],
          delegationHistory: [],
          originalAssignedBy: subTaskData.assignedBy,
        };
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  subTasks: [...(task.subTasks || []), newSubTask] 
                }
              : task
          )
        }));
        
        return newSubTask.id;
      },

      createNestedSubTask: (taskId, parentSubTaskId, subTaskData) => {
        // Get parent task to inherit projectId
        const parentTask = get().tasks.find(t => t.id === taskId);
        
        const newSubTask: SubTask = {
          ...subTaskData,
          id: Date.now().toString(),
          parentTaskId: parentSubTaskId, // Parent is the subtask, not the root task
          projectId: parentTask?.projectId || '',
          createdAt: new Date().toISOString(),
          updates: [],
          currentStatus: "not_started",
          completionPercentage: 0,
          attachments: subTaskData.attachments || [],
          location: subTaskData.location || undefined,
          subTasks: [],
          delegationHistory: [],
          originalAssignedBy: subTaskData.assignedBy,
        };
        
        // Recursively update the subtask tree
        const updateSubTaskTree = (subTasks: SubTask[]): SubTask[] => {
          return subTasks.map(subTask => {
            if (subTask.id === parentSubTaskId) {
              return {
                ...subTask,
                subTasks: [...(subTask.subTasks || []), newSubTask]
              };
            } else if (subTask.subTasks && subTask.subTasks.length > 0) {
              return {
                ...subTask,
                subTasks: updateSubTaskTree(subTask.subTasks)
              };
            }
            return subTask;
          });
        };
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  subTasks: updateSubTaskTree(task.subTasks || [])
                }
              : task
          )
        }));
        
        return newSubTask.id;
      },

      updateSubTask: (taskId, subTaskId, updates) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  subTasks: (task.subTasks || []).map(subTask =>
                    subTask.id === subTaskId ? { ...subTask, ...updates } : subTask
                  )
                }
              : task
          )
        }));
      },

      deleteSubTask: (taskId, subTaskId) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  subTasks: (task.subTasks || []).filter(subTask => subTask.id !== subTaskId)
                }
              : task
          )
        }));
      },

      updateSubTaskStatus: (taskId, subTaskId, status, completionPercentage) => {
        // Determine status based on completion percentage
        const autoStatus = getStatusFromCompletion(completionPercentage);
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  subTasks: (task.subTasks || []).map(subTask =>
                    subTask.id === subTaskId 
                      ? { ...subTask, currentStatus: autoStatus, completionPercentage }
                      : subTask
                  )
                }
              : task
          )
        }));
      },

      acceptSubTask: (taskId, subTaskId, userId) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  subTasks: (task.subTasks || []).map(subTask =>
                    subTask.id === subTaskId && subTask.assignedTo.includes(userId)
                      ? { ...subTask, accepted: true, declineReason: undefined }
                      : subTask
                  )
                }
              : task
          )
        }));
      },

      declineSubTask: (taskId, subTaskId, userId, reason) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  subTasks: (task.subTasks || []).map(subTask =>
                    subTask.id === subTaskId && subTask.assignedTo.includes(userId)
                      ? { ...subTask, accepted: false, declineReason: reason }
                      : subTask
                  )
                }
              : task
          )
        }));
      },

      getTasksByUser: (userId, projectId) => {
        const { tasks } = get();
        return tasks.filter(task => 
          task.assignedTo.includes(userId) && 
          (!projectId || task.projectId === projectId)
        );
      },

      getTasksAssignedBy: (userId, projectId) => {
        const { tasks } = get();
        return tasks.filter(task => 
          task.assignedBy === userId && 
          (!projectId || task.projectId === projectId)
        );
      },

      getOverdueTasks: (projectId) => {
        const { tasks } = get();
        const now = new Date();
        return tasks.filter(task => 
          new Date(task.dueDate) < now && 
          task.currentStatus !== "completed" &&
          (!projectId || task.projectId === projectId)
        );
      },

      getTasksByStatus: (status, projectId) => {
        const { tasks } = get();
        return tasks.filter(task => 
          task.currentStatus === status &&
          (!projectId || task.projectId === projectId)
        );
      },

      getTasksByPriority: (priority, projectId) => {
        const { tasks } = get();
        return tasks.filter(task => 
          task.priority === priority &&
          (!projectId || task.projectId === projectId)
        );
      },

      getTasksByProject: (projectId) => {
        const { tasks } = get();
        return tasks.filter(task => task.projectId === projectId);
      },

      // Mark task as read for a specific user
      markTaskAsRead: (userId, taskId) => {
        set(state => {
          // Check if status already exists
          const existingStatus = state.taskReadStatuses.find(
            s => s.userId === userId && s.taskId === taskId
          );

          if (existingStatus) {
            // Update existing status
            return {
              taskReadStatuses: state.taskReadStatuses.map(s =>
                s.userId === userId && s.taskId === taskId
                  ? { ...s, isRead: true, readAt: new Date().toISOString() }
                  : s
              )
            };
          } else {
            // Add new status
            return {
              taskReadStatuses: [
                ...state.taskReadStatuses,
                {
                  userId,
                  taskId,
                  isRead: true,
                  readAt: new Date().toISOString()
                }
              ]
            };
          }
        });
      },

      // Get count of unread tasks for a user
      getUnreadTaskCount: (userId) => {
        const { tasks, taskReadStatuses } = get();
        
        // Helper to collect all subtask IDs recursively
        const collectSubTaskIds = (subTasks: SubTask[] | undefined): string[] => {
          if (!subTasks) return [];
          const ids: string[] = [];
          for (const subTask of subTasks) {
            ids.push(subTask.id);
            if (subTask.subTasks) {
              ids.push(...collectSubTaskIds(subTask.subTasks));
            }
          }
          return ids;
        };

        // Get all tasks assigned to the user (parent tasks)
        const userParentTasks = tasks.filter(task => 
          task.assignedTo.includes(userId)
        );

        // Get all subtasks assigned to the user
        const userSubTaskIds: string[] = [];
        for (const task of tasks) {
          const allSubTaskIds = collectSubTaskIds(task.subTasks);
          for (const subTaskId of allSubTaskIds) {
            // Find the subtask to check if it's assigned to user
            const findSubTask = (subTasks: SubTask[] | undefined, id: string): SubTask | undefined => {
              if (!subTasks) return undefined;
              for (const st of subTasks) {
                if (st.id === id && st.assignedTo.includes(userId)) return st;
                const found = findSubTask(st.subTasks, id);
                if (found) return found;
              }
              return undefined;
            };
            if (findSubTask(task.subTasks, subTaskId)) {
              userSubTaskIds.push(subTaskId);
            }
          }
        }

        // Count unread parent tasks
        const unreadParentCount = userParentTasks.filter(task => {
          const readStatus = taskReadStatuses.find(
            s => s.userId === userId && s.taskId === task.id
          );
          return !readStatus || !readStatus.isRead;
        }).length;

        // Count unread subtasks
        const unreadSubTaskCount = userSubTaskIds.filter(subTaskId => {
          const readStatus = taskReadStatuses.find(
            s => s.userId === userId && s.taskId === subTaskId
          );
          return !readStatus || !readStatus.isRead;
        }).length;

        return unreadParentCount + unreadSubTaskCount;
      },
    }),
    {
      name: "buildtrack-tasks",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        taskReadStatuses: state.taskReadStatuses,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate status for all tasks and subtasks based on completion percentage
          // Also ensure all required arrays are initialized
          state.tasks = state.tasks.map(task => ({
            ...task,
            currentStatus: getStatusFromCompletion(task.completionPercentage),
            updates: task.updates || [],
            delegationHistory: task.delegationHistory || [],
            subTasks: (task.subTasks || []).map(subTask => ({
              ...subTask,
              currentStatus: getStatusFromCompletion(subTask.completionPercentage),
              updates: subTask.updates || [],
              delegationHistory: subTask.delegationHistory || [],
            }))
          }));
        }
      }
    }
  )
);