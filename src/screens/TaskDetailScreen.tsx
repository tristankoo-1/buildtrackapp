import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../state/authStore";
import { useTaskStore } from "../state/taskStore";
import { useUserStore } from "../state/userStore";
import { useCompanyStore } from "../state/companyStore";
import { TaskStatus, Priority, Task } from "../types/buildtrack";
import { cn } from "../utils/cn";
import StandardHeader from "../components/StandardHeader";

interface TaskDetailScreenProps {
  taskId: string;
  subTaskId?: string; // Optional: if provided, show only this subtask
  onNavigateBack: () => void;
}

export default function TaskDetailScreen({ taskId, subTaskId, onNavigateBack }: TaskDetailScreenProps) {
  const { user } = useAuthStore();
  const tasks = useTaskStore(state => state.tasks);
  const markTaskAsRead = useTaskStore(state => state.markTaskAsRead);
  const createSubTask = useTaskStore(state => state.createSubTask);
  const createNestedSubTask = useTaskStore(state => state.createNestedSubTask);
  const updateSubTaskStatus = useTaskStore(state => state.updateSubTaskStatus);
  const acceptSubTask = useTaskStore(state => state.acceptSubTask);
  const declineSubTask = useTaskStore(state => state.declineSubTask);
  const deleteSubTask = useTaskStore(state => state.deleteSubTask);
  const addTaskUpdate = useTaskStore(state => state.addTaskUpdate);
  const addSubTaskUpdate = useTaskStore(state => state.addSubTaskUpdate);
  const acceptTask = useTaskStore(state => state.acceptTask);
  const declineTask = useTaskStore(state => state.declineTask);
  const delegateTask = useTaskStore(state => state.delegateTask);
  const delegateSubTask = useTaskStore(state => state.delegateSubTask);
  const { getUserById, getAllUsers } = useUserStore();
  const { getCompanyBanner } = useCompanyStore();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateToUserId, setDelegateToUserId] = useState<string>("");
  const [delegateReason, setDelegateReason] = useState("");
  const [delegatingSubTaskId, setDelegatingSubTaskId] = useState<string | null>(null);
  const [updateForm, setUpdateForm] = useState({
    description: "",
    photos: [] as string[],
    completionPercentage: 0,
    status: "in_progress" as TaskStatus,
  });
  const [subTaskForm, setSubTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedTo: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

  // Get the parent task
  const parentTask = tasks.find(t => t.id === taskId);
  
  // If subTaskId is provided, find and display that subtask as the main task
  const subTask = subTaskId && parentTask 
    ? parentTask.subTasks?.find(st => st.id === subTaskId)
    : null;
  
  // Use subtask if viewing subtask, otherwise use parent task
  const task = subTask || parentTask;
  const isViewingSubTask = !!subTask;
  
  const assignedBy = task ? getUserById(task.assignedBy) : null;
  const assignedUsers = task ? task.assignedTo.map(userId => getUserById(userId)).filter(Boolean) : [];

  // Helper functions for styling
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50";
      case "in_progress": return "text-blue-600 bg-blue-50";
      case "blocked": return "text-red-600 bg-red-50";
      case "not_started": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Compact Task Card Component
  const CompactTaskCard = ({ task }: { task: Task }) => (
    <Pressable 
      className="bg-white border border-gray-200 rounded-lg p-4 mb-2"
      onPress={() => {
        setSelectedTaskForDetail(task);
        setShowTaskDetailModal(true);
      }}
    >
      {/* Line 1: Title and Priority */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-900 text-base flex-1 mr-2" numberOfLines={1}>
          {task.title}
        </Text>
        <View className={cn("px-2 py-1 rounded", getPriorityColor(task.priority))}>
          <Text className="text-xs font-bold capitalize">
            {task.priority}
          </Text>
        </View>
      </View>
      
      {/* Line 2: Due Date and Status */}
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        </View>
        <Text className={cn("text-sm font-medium capitalize", getStatusColor(task.currentStatus))}>
          {task.currentStatus.replace("_", " ")}
        </Text>
      </View>
      
      {/* Line 3: Progress Bar */}
      <View className="flex-row items-center">
        <View className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
          <View 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${task.completionPercentage}%` }}
          />
        </View>
        <Text className="text-xs text-gray-600 font-semibold w-10 text-right">{task.completionPercentage}%</Text>
      </View>
    </Pressable>
  );

  // Mark task as read when viewing
  useEffect(() => {
    if (user && taskId) {
      markTaskAsRead(user.id, taskId);
      if (subTaskId) {
        markTaskAsRead(user.id, subTaskId);
      }
    }
  }, [taskId, subTaskId, user?.id, markTaskAsRead]);

  if (!user || !task) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        
        {/* Header */}
        <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
          <Text className="text-xl font-semibold text-gray-900 flex-1">
            {isViewingSubTask ? "Sub-Task Details" : "Task Details"}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            {isViewingSubTask ? "Sub-Task Not Found" : "Task Not Found"}
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            The {isViewingSubTask ? "sub-task" : "task"} you're looking for doesn't exist or has been removed.
          </Text>
          <Pressable 
            onPress={onNavigateBack} 
            className="px-6 py-3 bg-blue-600 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const assignedTo = task.assignedTo || [];
  const isAssignedToMe = Array.isArray(assignedTo) && assignedTo.includes(user.id);
  const isTaskCreator = task.assignedBy === user.id;

  const canUpdateProgress = isAssignedToMe || isTaskCreator;

  const handleAcceptTask = () => {
    Alert.alert(
      "Accept Task",
      `Are you sure you want to accept "${task.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            acceptTask(task.id, user.id);
            Alert.alert("Success", "Task accepted successfully! You can now start working on it.");
          }
        }
      ]
    );
  };

  const handleDeclineTask = () => {
    Alert.prompt(
      "Decline Task",
      "Please provide a reason for declining this task:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: (reason: string | undefined) => {
            if (reason && reason.trim()) {
              declineTask(task.id, user.id, reason.trim());
              Alert.alert("Task Declined", "The task has been declined.");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleAddPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setUpdateForm(prev => ({
          ...prev,
          photos: [...prev.photos, ...newPhotos],
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const handleSubmitUpdate = async () => {
    if (!updateForm.description.trim()) {
      Alert.alert("Error", "Please provide a description for this update");
      return;
    }

    setIsSubmitting(true);

    try {
      // Status is automatically calculated in the store based on completion percentage
      const calculatedStatus: TaskStatus = 
        updateForm.completionPercentage === 0 ? "not_started" :
        updateForm.completionPercentage === 100 ? "completed" :
        "in_progress";

      const updatePayload = {
        description: updateForm.description,
        photos: updateForm.photos,
        completionPercentage: updateForm.completionPercentage,
        status: calculatedStatus,
        userId: user.id,
      };

      // Use appropriate method based on whether viewing subtask
      if (isViewingSubTask && subTaskId) {
        addSubTaskUpdate(taskId, subTaskId, updatePayload);
      } else {
        addTaskUpdate(task.id, updatePayload);
      }

      setUpdateForm({
        description: "",
        photos: [],
        completionPercentage: updateForm.completionPercentage,
        status: calculatedStatus,
      });

      setShowUpdateModal(false);
      
      let successMessage = "Progress update added successfully!";
      if (updateForm.completionPercentage === 100) {
        successMessage = "🎉 Task marked as completed! Great job!";
      }
      
      Alert.alert("Success", successMessage);
    } catch (error) {
      Alert.alert("Error", "Failed to submit update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelegateTask = () => {
    if (!delegateToUserId) {
      Alert.alert("Error", "Please select a user to delegate to");
      return;
    }

    // If we're viewing a subtask, delegate that subtask
    // Otherwise use the delegatingSubTaskId if set, or delegate the main task
    const result = isViewingSubTask && subTaskId
      ? delegateSubTask(taskId, subTaskId, user.id, delegateToUserId, delegateReason.trim() || undefined)
      : delegatingSubTaskId 
        ? delegateSubTask(taskId, delegatingSubTaskId, user.id, delegateToUserId, delegateReason.trim() || undefined)
        : delegateTask(taskId, user.id, delegateToUserId, delegateReason.trim() || undefined);

    if (result.success) {
      Alert.alert(
        "Success", 
        `${isViewingSubTask ? "Sub-task" : "Task"} delegated successfully! The new assignee will need to accept it.`
      );
      setShowDelegateModal(false);
      setDelegateToUserId("");
      setDelegateReason("");
      setDelegatingSubTaskId(null);
    } else {
      Alert.alert("Delegation Failed", result.error || "An error occurred");
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.currentStatus !== "completed";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Standard Header */}
      <StandardHeader 
        title={isViewingSubTask ? "Sub-Task Details" : "Task Details"}
        rightElement={
          canUpdateProgress ? (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  setDelegatingSubTaskId(null);
                  setDelegateToUserId("");
                  setDelegateReason("");
                  setShowDelegateModal(true);
                }}
                className="px-3 py-2 bg-purple-600 rounded-lg"
              >
                <Ionicons name="people" size={18} color="white" />
              </Pressable>
              <Pressable
                onPress={() => {
                  setUpdateForm({
                    description: "",
                    photos: [],
                    completionPercentage: task.completionPercentage,
                    status: task.currentStatus,
                  });
                  setShowUpdateModal(true);
                }}
                className="px-4 py-2 bg-blue-600 rounded-lg"
              >
                <Text className="text-white font-medium">Update</Text>
              </Pressable>
            </View>
          ) : undefined
        }
      />

      <ScrollView className="flex-1">
        {/* Task Cards List */}
        <View className="px-6 mt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            {isViewingSubTask ? "Sub-Task Details" : "Task Details"}
          </Text>
          
          {/* Main Task Card */}
          <CompactTaskCard task={task} />
          
          {/* Sub-tasks Cards */}
          {(task.subTasks || []).length > 0 && (
            <View className="mt-4">
              <Text className="text-base font-semibold text-gray-700 mb-3">
                {isViewingSubTask ? "Nested Sub-Tasks" : "Sub-Tasks"} ({(task.subTasks || []).length})
              </Text>
              {(task.subTasks || []).map((subTask) => (
                <CompactTaskCard key={subTask.id} task={subTask} />
              ))}
            </View>
          )}
        </View>

        {/* Assignment Information Card */}
        <View className="bg-white mx-6 mt-4 rounded-xl border border-gray-200 p-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</Text>
          
          {/* Assigned By */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">Assigned By</Text>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {assignedBy?.id === user.id ? "Me" : (assignedBy?.name || "Unknown User")}
                </Text>
                <Text className="text-sm text-gray-500 capitalize">
                  {assignedBy?.id === user.id ? "You" : (assignedBy?.role || "Unknown Role")}
                </Text>
                <Text className="text-xs text-gray-400">
                  {assignedBy?.id === user.id ? "" : (assignedBy?.email || "")}
                </Text>
              </View>
            </View>
          </View>

          {/* Assigned To */}
          <View>
            <Text className="text-sm font-medium text-gray-600 mb-2">Assigned To</Text>
            {assignedUsers.length > 0 ? (
              <View className="space-y-3">
                {assignedUsers.map((assignedUser) => {
                  if (!assignedUser) return null;
                  
                  // Get progress for this user from task updates
                  const userUpdates = task.updates?.filter(update => update.userId === assignedUser.id) || [];
                  const latestUpdate = userUpdates[userUpdates.length - 1];
                  const userProgress = latestUpdate?.completionPercentage || 0;
                  
                  return (
                    <View key={assignedUser.id} className="flex-row items-center">
                      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                        <Ionicons name="person" size={20} color="#10b981" />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-base font-semibold text-gray-900">
                            {assignedUser.id === user.id ? "Me" : assignedUser.name}
                          </Text>
                          <View className="flex-row items-center">
                            <View className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <View 
                                className={cn(
                                  "h-2 rounded-full",
                                  userProgress === 100 ? "bg-green-500" :
                                  userProgress >= 75 ? "bg-blue-500" :
                                  userProgress >= 50 ? "bg-yellow-500" :
                                  userProgress >= 25 ? "bg-orange-500" :
                                  "bg-gray-400"
                                )}
                                style={{ width: `${userProgress}%` }}
                              />
                            </View>
                            <Text className="text-xs font-medium text-gray-600 w-8">
                              {userProgress}%
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm text-gray-500 capitalize">
                          {assignedUser.id === user.id ? "You" : assignedUser.role}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {assignedUser.id === user.id ? "" : assignedUser.email}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={20} color="#6b7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-500">
                    No one assigned
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>


        {/* Delegation History */}
        {task.delegationHistory && task.delegationHistory.length > 0 && (
          <View className="bg-white mx-6 mt-4 rounded-xl border border-gray-200 p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Delegation History</Text>
            <View className="space-y-3">
              {task.delegationHistory.map((delegation, index) => {
                const fromUser = getUserById(delegation.fromUserId);
                const toUser = getUserById(delegation.toUserId);
                return (
                  <View key={delegation.id} className="border-l-4 border-purple-200 pl-4 py-2">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="arrow-forward" size={14} color="#7c3aed" />
                      <Text className="text-sm text-gray-900 ml-2">
                        <Text className="font-medium">{fromUser?.name || "Unknown"}</Text>
                        {" → "}
                        <Text className="font-medium">{toUser?.name || "Unknown"}</Text>
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {new Date(delegation.timestamp).toLocaleString()}
                    </Text>
                    {delegation.reason && (
                      <Text className="text-sm text-gray-600 mt-1 italic">
                        "{delegation.reason}"
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
            {task.originalAssignedBy && (
              <View className="mt-3 pt-3 border-t border-gray-200">
                <Text className="text-xs text-gray-500">
                  Original Creator: <Text className="font-medium text-gray-700">{getUserById(task.originalAssignedBy)?.name || "Unknown"}</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Task Acceptance */}
        {isAssignedToMe && task.accepted === undefined && (
          <View className="bg-white mx-6 mt-4 rounded-xl border border-gray-200 p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">{isViewingSubTask ? "Sub-Task" : "Task"} Assignment</Text>
            <Text className="text-gray-600 mb-4">
              You have been assigned to this {isViewingSubTask ? "sub-task" : "task"}. Please accept or decline.
            </Text>
            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => {
                  if (isViewingSubTask && subTaskId) {
                    acceptSubTask(taskId, subTaskId, user.id);
                    Alert.alert("Success", "Sub-task accepted successfully! You can now start working on it.");
                  } else {
                    handleAcceptTask();
                  }
                }}
                className="flex-1 bg-green-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">Accept {isViewingSubTask ? "Sub-Task" : "Task"}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (isViewingSubTask && subTaskId) {
                    Alert.prompt(
                      "Decline Sub-Task",
                      "Please provide a reason for declining this sub-task:",
                      (reason) => {
                        if (reason && reason.trim()) {
                          declineSubTask(taskId, subTaskId, user.id, reason.trim());
                          Alert.alert("Sub-Task Declined", "The sub-task has been declined.");
                        }
                      },
                      "plain-text"
                    );
                  } else {
                    handleDeclineTask();
                  }
                }}
                className="flex-1 bg-red-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">Decline</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Add Sub-Task Button */}
        {(isAssignedToMe || isTaskCreator) && (
          <View className="bg-white mx-6 mt-4 rounded-xl border border-gray-200 p-6">
            <Pressable
              onPress={() => {
                setSubTaskForm({
                  title: "",
                  description: "",
                  priority: "medium",
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  assignedTo: [],
                });
                setShowSubTaskModal(true);
              }}
              className="flex-row items-center justify-center bg-blue-50 px-4 py-3 rounded-lg"
            >
              <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
              <Text className="text-blue-600 font-medium ml-2">
                Add {isViewingSubTask ? "Nested Sub-Task" : "Sub-Task"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Task Updates */}
        <View className="bg-white mx-6 mt-4 rounded-xl border border-gray-200 p-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Updates</Text>
            <Text className="text-sm text-gray-500">{task.updates.length} updates</Text>
          </View>
          
          {task.updates.length > 0 ? (
            <View className="space-y-4">
              {task.updates.map((update) => {
                const updateUser = getUserById(update.userId);
                return (
                  <View key={update.id} className="border-l-4 border-blue-200 pl-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-medium text-gray-900">
                        {updateUser?.name || "Unknown User"}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(update.timestamp).toLocaleString()}
                      </Text>
                    </View>
                    <Text className="text-gray-700 mb-2">{update.description}</Text>
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-sm text-gray-500">
                        Progress: {update.completionPercentage}%
                      </Text>
                      <View className={cn("px-2 py-1 rounded", getStatusColor(update.status))}>
                        <Text className="text-xs capitalize">
                          {update.status.replace("_", " ")}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-2">No updates yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Update Modal */}
      <Modal
        visible={showUpdateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setShowUpdateModal(false)}
              className="mr-4"
            >
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Progress Update
            </Text>
            <Pressable
              onPress={handleSubmitUpdate}
              disabled={isSubmitting}
              className={cn(
                "px-4 py-2 rounded-lg",
                isSubmitting ? "bg-gray-300" : "bg-blue-600"
              )}
            >
              <Text className="text-white font-medium">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Description */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Update Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white"
                placeholder="Describe what you've accomplished..."
                value={updateForm.description}
                onChangeText={(text) => setUpdateForm(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Progress Slider */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Completion Percentage
              </Text>
              <Text className="text-3xl font-bold text-blue-600 text-center mb-4">
                {updateForm.completionPercentage}%
              </Text>
              <Slider
                style={{ height: 40 }}
                minimumValue={0}
                maximumValue={100}
                step={10}
                value={updateForm.completionPercentage}
                onValueChange={(value: number) => setUpdateForm(prev => ({ ...prev, completionPercentage: value }))}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#d1d5db"
              />
            </View>

            {/* Automatic Status Info */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">Status</Text>
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <View className="flex-row items-start mb-2">
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <Text className="text-blue-900 font-medium ml-2 flex-1">
                    Status is automatically set based on completion:
                  </Text>
                </View>
                <View className="ml-7 space-y-1">
                  <Text className="text-blue-800 text-sm">• 0% = Not Started</Text>
                  <Text className="text-blue-800 text-sm">• 1-99% = In Progress</Text>
                  <Text className="text-blue-800 text-sm">• 100% = Completed</Text>
                </View>
              </View>
            </View>

            {/* Photos */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">Photos</Text>
              <Pressable
                onPress={handleAddPhotos}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white items-center"
              >
                <Ionicons name="camera-outline" size={32} color="#6b7280" />
                <Text className="text-gray-600 mt-2">Add photos to document progress</Text>
              </Pressable>
              
              {updateForm.photos.length > 0 && (
                <View className="mt-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    {updateForm.photos.length} photo{updateForm.photos.length > 1 ? "s" : ""} selected
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                      {updateForm.photos.map((_photo, index) => (
                        <View key={index} className="mr-3 bg-gray-100 rounded-lg p-4">
                          <Ionicons name="image-outline" size={32} color="#6b7280" />
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Sub-Task Creation Modal */}
      <Modal
        visible={showSubTaskModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setShowSubTaskModal(false)}
              className="mr-4"
            >
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Create Sub-Task
            </Text>
            <Pressable
              onPress={() => {
                if (!subTaskForm.title.trim()) {
                  Alert.alert("Error", "Please enter a title");
                  return;
                }
                if (!subTaskForm.description.trim()) {
                  Alert.alert("Error", "Please enter a description");
                  return;
                }
                if (subTaskForm.assignedTo.length === 0) {
                  Alert.alert("Error", "Please assign to at least one user");
                  return;
                }

                const subTaskPayload = {
                  ...subTaskForm,
                  dueDate: subTaskForm.dueDate.toISOString(),
                  assignedBy: user.id,
                  updates: [],
                  projectId: task.projectId,
                  category: task.category,
                  attachments: [],
                };

                // If viewing a subtask, create nested subtask
                // Otherwise create direct subtask under parent task
                if (isViewingSubTask && subTaskId) {
                  createNestedSubTask(taskId, subTaskId, subTaskPayload);
                } else {
                  createSubTask(taskId, subTaskPayload);
                }

                Alert.alert("Success", `${isViewingSubTask ? "Nested sub-task" : "Sub-task"} created successfully!`);
                setShowSubTaskModal(false);
              }}
              className="px-4 py-2 bg-blue-600 rounded-lg"
            >
              <Text className="text-white font-medium">Create</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Title */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-2">Title</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white"
                placeholder="Enter sub-task title..."
                value={subTaskForm.title}
                onChangeText={(text) => setSubTaskForm(prev => ({ ...prev, title: text }))}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-2">Description</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white"
                placeholder="Describe the sub-task..."
                value={subTaskForm.description}
                onChangeText={(text) => setSubTaskForm(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Priority */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-2">Priority</Text>
              <View className="flex-row flex-wrap gap-2">
                {(["low", "medium", "high", "critical"] as Priority[]).map((priority) => (
                  <Pressable
                    key={priority}
                    onPress={() => setSubTaskForm(prev => ({ ...prev, priority }))}
                    className={cn(
                      "px-4 py-3 rounded-lg border-2 flex-1 min-w-[40%]",
                      subTaskForm.priority === priority
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    <Text className={cn(
                      "text-center font-medium capitalize",
                      subTaskForm.priority === priority
                        ? "text-blue-600"
                        : "text-gray-700"
                    )}>
                      {priority}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Due Date */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-2">Due Date</Text>
              <Pressable
                onPress={() => setShowUserPicker(true)}
                className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              >
                <Text className="text-gray-900">
                  {subTaskForm.dueDate.toLocaleDateString()}
                </Text>
              </Pressable>
            </View>

            {/* Assign To */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-2">Assign To</Text>
              <View className="border border-gray-300 rounded-lg bg-white p-4">
                {getAllUsers()
                  .filter(u => u.role !== "admin" && u.id !== user.id)
                  .map(assignUser => (
                    <Pressable
                      key={assignUser.id}
                      onPress={() => {
                        setSubTaskForm(prev => ({
                          ...prev,
                          assignedTo: (prev.assignedTo || []).includes(assignUser.id)
                            ? (prev.assignedTo || []).filter(id => id !== assignUser.id)
                            : [...prev.assignedTo, assignUser.id]
                        }));
                      }}
                      className="flex-row items-center py-2 border-b border-gray-100"
                    >
                      <View className={cn(
                        "w-5 h-5 rounded border-2 mr-3 items-center justify-center",
                        (subTaskForm.assignedTo || []).includes(assignUser.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      )}>
                        {(subTaskForm.assignedTo || []).includes(assignUser.id) && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">{assignUser.name}</Text>
                        <Text className="text-sm text-gray-500 capitalize">{assignUser.role}</Text>
                      </View>
                    </Pressable>
                  ))}
              </View>
              {subTaskForm.assignedTo.length > 0 && (
                <Text className="text-sm text-gray-500 mt-2">
                  {subTaskForm.assignedTo.length} user{subTaskForm.assignedTo.length > 1 ? "s" : ""} selected
                </Text>
              )}
            </View>

            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
                <Text className="text-blue-700 text-sm ml-2 flex-1">
                  {isViewingSubTask 
                    ? "Nested sub-tasks allow you to further break down this sub-task into even smaller pieces. This creates a hierarchy of tasks for complex workflows."
                    : "Sub-tasks help break down complex tasks into manageable pieces that can be assigned to different team members."
                  }
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Delegation Modal */}
      <Modal
        visible={showDelegateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => {
                setShowDelegateModal(false);
                setDelegateToUserId("");
                setDelegateReason("");
                setDelegatingSubTaskId(null);
              }}
              className="mr-4"
            >
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Delegate {delegatingSubTaskId ? "Sub-Task" : "Task"}
            </Text>
            <Pressable
              onPress={handleDelegateTask}
              className="px-4 py-2 bg-purple-600 rounded-lg"
            >
              <Text className="text-white font-medium">Delegate</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            <View className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#7c3aed" />
                <View className="ml-2 flex-1">
                  <Text className="text-purple-900 font-medium mb-1">
                    About Delegation
                  </Text>
                  <Text className="text-purple-800 text-sm">
                    Delegating transfers this task to another user. They will need to accept it before they can start working.
                  </Text>
                  <Text className="text-purple-800 text-sm mt-2 font-medium">
                    Loop Prevention: You cannot delegate to someone who has previously delegated this task.
                  </Text>
                </View>
              </View>
            </View>

            {/* Select User */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Delegate To
              </Text>
              <View className="bg-white rounded-lg border border-gray-300">
                {getAllUsers()
                  .filter(u => u.role !== "admin" && u.id !== user.id)
                  .map(delegateUser => (
                    <Pressable
                      key={delegateUser.id}
                      onPress={() => setDelegateToUserId(delegateUser.id)}
                      className="flex-row items-center p-4 border-b border-gray-100"
                    >
                      <View className={cn(
                        "w-5 h-5 rounded-full border-2 mr-3 items-center justify-center",
                        delegateToUserId === delegateUser.id
                          ? "bg-purple-600 border-purple-600"
                          : "border-gray-300"
                      )}>
                        {delegateToUserId === delegateUser.id && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">{delegateUser.name}</Text>
                        <Text className="text-sm text-gray-500 capitalize">{delegateUser.role}</Text>
                      </View>
                    </Pressable>
                  ))}
              </View>
            </View>

            {/* Reason (Optional) */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-2">
                Reason (Optional)
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-white"
                placeholder="Why are you delegating this task?"
                value={delegateReason}
                onChangeText={setDelegateReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text className="text-xs text-gray-500 mt-1">
                {delegateReason.length}/200
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Task Detail Slider Modal */}
      <Modal
        visible={showTaskDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => {
                setShowTaskDetailModal(false);
                setSelectedTaskForDetail(null);
              }}
              className="mr-4"
            >
              <Text className="text-blue-600 font-medium">Close</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Task Details
            </Text>
          </View>

          {selectedTaskForDetail && (
            <ScrollView className="flex-1 px-6 py-4">
              {/* Task Info Card */}
              <View className="bg-white rounded-xl p-6 mb-4">
                {/* Title */}
                <Text className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedTaskForDetail.title}
                </Text>

                {/* Status and Priority */}
                <View className="flex-row items-center mb-4">
                  <View className={cn("px-3 py-1.5 rounded-full mr-3", getStatusColor(selectedTaskForDetail.currentStatus))}>
                    <Text className="text-sm font-medium capitalize">
                      {selectedTaskForDetail.currentStatus.replace("_", " ")}
                    </Text>
                  </View>
                  <View className={cn("px-3 py-1.5 rounded-full border", getPriorityColor(selectedTaskForDetail.priority))}>
                    <Text className="text-sm font-medium capitalize">
                      {selectedTaskForDetail.priority} Priority
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text className="text-gray-700 text-base leading-6 mb-6">
                  {selectedTaskForDetail.description}
                </Text>

                {/* Task Details Grid */}
                <View className="space-y-4">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-gray-500">Due Date</Text>
                      <Text className={cn("font-medium", new Date(selectedTaskForDetail.dueDate) < new Date() && selectedTaskForDetail.currentStatus !== "completed" ? "text-red-600" : "text-gray-900")}>
                        {new Date(selectedTaskForDetail.dueDate).toLocaleDateString()} 
                        {new Date(selectedTaskForDetail.dueDate) < new Date() && selectedTaskForDetail.currentStatus !== "completed" && " (Overdue)"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="pricetag-outline" size={20} color="#6b7280" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-gray-500">Category</Text>
                      <Text className="font-medium text-gray-900 capitalize">
                        {selectedTaskForDetail.category}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={20} color="#6b7280" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-gray-500">Assigned By</Text>
                      <Text className="font-medium text-gray-900">
                        {getUserById(selectedTaskForDetail.assignedBy)?.name || "Unknown"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={20} color="#6b7280" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-gray-500">Assigned To</Text>
                      <Text className="font-medium text-gray-900">
                        {selectedTaskForDetail.assignedTo.map(userId => getUserById(userId)?.name).filter(Boolean).join(", ")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Progress Card */}
              <View className="bg-white rounded-xl p-6 mb-4">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Progress</Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600">Completion</Text>
                  <Text className={cn(
                    "font-semibold text-2xl",
                    selectedTaskForDetail.completionPercentage === 100 ? "text-green-600" :
                    selectedTaskForDetail.completionPercentage >= 75 ? "text-blue-600" :
                    selectedTaskForDetail.completionPercentage >= 50 ? "text-yellow-600" :
                    selectedTaskForDetail.completionPercentage >= 25 ? "text-orange-600" :
                    "text-gray-600"
                  )}>
                    {selectedTaskForDetail.completionPercentage}%
                  </Text>
                </View>
                <View className="w-full bg-gray-200 rounded-full h-4">
                  <View 
                    className={cn(
                      "h-4 rounded-full",
                      selectedTaskForDetail.completionPercentage === 100 ? "bg-green-500" :
                      selectedTaskForDetail.completionPercentage >= 75 ? "bg-blue-500" :
                      selectedTaskForDetail.completionPercentage >= 50 ? "bg-yellow-500" :
                      selectedTaskForDetail.completionPercentage >= 25 ? "bg-orange-500" :
                      "bg-gray-400"
                    )} 
                    style={{ width: `${selectedTaskForDetail.completionPercentage}%` }}
                  />
                </View>
                {selectedTaskForDetail.completionPercentage === 100 && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text className="text-green-600 text-sm font-medium ml-1">
                      Task Completed!
                    </Text>
                  </View>
                )}
              </View>

              {/* Task Updates */}
              <View className="bg-white rounded-xl p-6 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-gray-900">Updates</Text>
                  <Text className="text-sm text-gray-500">{selectedTaskForDetail.updates.length} updates</Text>
                </View>
                
                {selectedTaskForDetail.updates.length > 0 ? (
                  <View className="space-y-4">
                    {selectedTaskForDetail.updates.map((update) => {
                      const updateUser = getUserById(update.userId);
                      return (
                        <View key={update.id} className="border-l-4 border-blue-200 pl-4">
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="font-medium text-gray-900">
                              {updateUser?.name || "Unknown User"}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {new Date(update.timestamp).toLocaleString()}
                            </Text>
                          </View>
                          <Text className="text-gray-700 mb-2">{update.description}</Text>
                          <View className="flex-row items-center space-x-4">
                            <Text className="text-sm text-gray-500">
                              Progress: {update.completionPercentage}%
                            </Text>
                            <View className={cn("px-2 py-1 rounded", getStatusColor(update.status))}>
                              <Text className="text-xs capitalize">
                                {update.status.replace("_", " ")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View className="py-8 items-center">
                    <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
                    <Text className="text-gray-500 mt-2">No updates yet</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}