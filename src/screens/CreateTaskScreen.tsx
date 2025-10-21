import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../state/authStore";
import { useTaskStore } from "../state/taskStore";
import { useUserStore } from "../state/userStore";
import { useProjectStore } from "../state/projectStore";
import { useCompanyStore } from "../state/companyStore";
import { Priority, TaskCategory } from "../types/buildtrack";
import { cn } from "../utils/cn";
import ModalHandle from "../components/ModalHandle";
import { notifyDataMutation } from "../utils/DataRefreshManager";
import StandardHeader from "../components/StandardHeader";

interface CreateTaskScreenProps {
  onNavigateBack: () => void;
}

// InputField component defined outside to prevent re-creation
const InputField = ({ 
  label, 
  required = true, 
  error, 
  children 
}: { 
  label: string; 
  required?: boolean; 
  error?: string; 
  children: React.ReactNode;
}) => (
  <View className="mb-4">
    <Text className="text-sm font-medium text-gray-700 mb-2">
      {label} {required && <Text className="text-red-500">*</Text>}
    </Text>
    {children}
    {error && (
      <Text className="text-red-500 text-xs mt-1">{error}</Text>
    )}
  </View>
);

export default function CreateTaskScreen({ onNavigateBack }: CreateTaskScreenProps) {
  const { user } = useAuthStore();
  const { createTask } = useTaskStore();
  const { getUsersByRole, getUserById } = useUserStore();
  const { getProjectsByUser, getProjectUserAssignments } = useProjectStore();
  const { getCompanyBanner } = useCompanyStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "general" as TaskCategory,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    assignedTo: [] as string[],
    attachments: [] as string[],
    projectId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  // All hooks must be called before any early returns
  const userProjects = getProjectsByUser(user?.id || "");
  const workers = getUsersByRole("worker");
  const managers = getUsersByRole("manager");
  const { companies } = useCompanyStore();
  
  // Filter users based on selected project
  // Only show users who are assigned to the selected project
  const allAssignableUsers = React.useMemo(() => {
    if (!formData.projectId) {
      // If no project selected, show all workers and managers
      return [...workers, ...managers];
    }
    
    // Get users assigned to the selected project
    const projectAssignments = getProjectUserAssignments(formData.projectId);
    const assignedUserIds = new Set(projectAssignments.map(a => a.userId));
    
    // Filter to only show users assigned to this project
    const eligibleUsers = [...workers, ...managers].filter(u => assignedUserIds.has(u.id));
    
    return eligibleUsers;
  }, [formData.projectId, workers, managers, getProjectUserAssignments]);

  // Set default project if user has access to projects
  React.useEffect(() => {
    if (userProjects.length > 0 && !formData.projectId) {
      setFormData(prev => ({ ...prev, projectId: userProjects[0].id }));
    }
  }, [userProjects, formData.projectId]);

  // Clear selected users when project changes (since eligible users change)
  React.useEffect(() => {
    if (formData.projectId) {
      // Filter out users who are no longer eligible
      const eligibleUserIds = new Set(allAssignableUsers.map(u => u.id));
      const stillEligible = selectedUsers.filter(id => eligibleUserIds.has(id));
      
      if (stillEligible.length !== selectedUsers.length) {
        setSelectedUsers(stillEligible);
        setFormData(prev => ({ ...prev, assignedTo: stillEligible }));
      }
    }
  }, [formData.projectId, allAssignableUsers]);

  const handleTitleChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, title: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, description: text }));
  }, []);

  const handlePriorityChange = useCallback((priority: Priority) => {
    setFormData(prev => ({ ...prev, priority }));
  }, []);

  const handleCategoryChange = useCallback((category: TaskCategory) => {
    setFormData(prev => ({ ...prev, category }));
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  }, []);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  // Early returns AFTER all hooks
  if (!user) return null;

  // Admin users should not be able to create tasks
  if (user.role === "admin") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <Pressable onPress={onNavigateBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="flex-1 text-xl font-semibold text-gray-900">
            Create Task
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="shield-outline" size={32} color="#f59e0b" />
              </View>
              <Text className="text-lg font-semibold text-amber-900 text-center mb-2">
                Access Restricted
              </Text>
              <Text className="text-sm text-amber-800 text-center leading-5">
                Administrator accounts cannot create or be assigned tasks. This function is reserved for managers and workers.
              </Text>
            </View>
            <Pressable 
              onPress={onNavigateBack}
              className="bg-amber-600 rounded-lg py-3 px-4"
            >
              <Text className="text-white font-semibold text-center">
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.projectId) {
      newErrors.projectId = "Please select a project";
    }

    if (selectedUsers.length === 0) {
      newErrors.assignedTo = "Please select at least one person to assign this task";
    }

    if (formData.dueDate <= new Date()) {
      newErrors.dueDate = "Due date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear any existing errors before validation
    setErrors({});
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate.toISOString(),
        assignedTo: selectedUsers,
        assignedBy: user.id,
        attachments: formData.attachments,
        projectId: formData.projectId,
      });

      // Notify all users about the new task
      notifyDataMutation('task');

      Alert.alert(
        "Task Created",
        "Task has been created successfully and assigned to the selected users.",
        [
          {
            text: "OK",
            onPress: () => onNavigateBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to create task. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map(asset => asset.uri);
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newAttachments],
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Standard Header */}
      <StandardHeader 
        title="Create New Task"
        rightElement={
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "px-4 py-2 rounded-lg",
              isSubmitting 
                ? "bg-gray-300" 
                : "bg-blue-600"
            )}
          >
            <Text className="text-white font-medium">
              {isSubmitting ? "Creating..." : "Create"}
            </Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6 py-4" 
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <InputField label="Title" error={errors.title}>
              <TextInput
                className={cn(
                  "border rounded-lg px-3 py-3 text-gray-900 bg-white",
                  errors.title ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Enter task title (e.g., Fix Roof Leak)"
                value={formData.title}
                onChangeText={handleTitleChange}
                maxLength={100}
                autoCorrect={false}
                returnKeyType="next"
              />
          </InputField>

          {/* Description */}
          <InputField label="Description" error={errors.description}>
              <TextInput
                className={cn(
                  "border rounded-lg px-3 py-3 text-gray-900 bg-white",
                  errors.description ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Describe the task in detail..."
                value={formData.description}
                onChangeText={handleDescriptionChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
                autoCorrect={false}
                returnKeyType="done"
              />
          </InputField>

          {/* Project Selection */}
          <InputField label="Project" error={errors.projectId}>
            <Pressable
              onPress={() => setShowProjectPicker(true)}
              className={cn(
                "border rounded-lg px-3 py-3 bg-white flex-row items-center justify-between",
                errors.projectId ? "border-red-300" : "border-gray-300"
              )}
            >
              <Text className={cn(
                "flex-1",
                formData.projectId ? "text-gray-900" : "text-gray-500"
              )}>
                {formData.projectId 
                  ? userProjects.find(p => p.id === formData.projectId)?.name 
                  : "Select a project"
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </Pressable>
          </InputField>

          {/* Priority and Category Row */}
          <View className="mb-4">
            <View className="mb-4">
              <InputField label="Priority">
                <Pressable
                  onPress={() => setShowPriorityPicker(true)}
                  className="border rounded-lg px-3 py-3 bg-white flex-row items-center justify-between"
                >
                  <Text className="text-gray-900 capitalize flex-1">
                    {formData.priority}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </Pressable>
              </InputField>
            </View>

            <InputField label="Category">
              <Pressable
                onPress={() => setShowCategoryPicker(true)}
                className="border rounded-lg px-3 py-3 bg-white flex-row items-center justify-between"
              >
                <Text className="text-gray-900 capitalize flex-1">
                  {formData.category}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </Pressable>
            </InputField>
          </View>

          {/* Due Date */}
          <InputField label="Due Date" error={errors.dueDate}>
            <Pressable
              onPress={() => setShowDatePicker(!showDatePicker)}
              className={cn(
                "border-2 rounded-lg px-3 py-3 bg-white flex-row items-center justify-between",
                showDatePicker ? "border-blue-600" : errors.dueDate ? "border-red-300" : "border-gray-300"
              )}
            >
              <Text className={cn(
                "font-medium",
                showDatePicker ? "text-blue-600" : "text-gray-900"
              )}>
                {formData.dueDate.toLocaleDateString("en-US", { 
                  weekday: 'short',
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <Ionicons 
                name={showDatePicker ? "calendar" : "calendar-outline"} 
                size={20} 
                color={showDatePicker ? "#3b82f6" : "#6b7280"} 
              />
            </Pressable>
          </InputField>

          {/* Date Picker - Visible when showDatePicker is true */}
          {showDatePicker && (
            <View className="bg-white border-2 border-blue-600 rounded-lg mb-4 overflow-hidden">
              <DateTimePicker
                value={formData.dueDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    handleDateChange(selectedDate);
                  }
                }}
                textColor="#000000"
                style={{ height: 200 }}
              />
              <View className="flex-row justify-end p-3 border-t border-gray-200">
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="bg-blue-600 px-6 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Assign To */}
          <InputField label="Assign To" error={errors.assignedTo}>
            <Pressable
              onPress={() => setShowUserPicker(!showUserPicker)}
              className={cn(
                "border rounded-lg px-3 py-3 bg-white flex-row items-center justify-between",
                errors.assignedTo ? "border-red-300" : "border-gray-300"
              )}
            >
              <Text className="text-gray-900">
                {selectedUsers.length > 0 
                  ? `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""} selected`
                  : "Select users to assign"
                }
              </Text>
              <Ionicons 
                name={showUserPicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6b7280" 
              />
            </Pressable>
          </InputField>

          {/* User Selection List */}
          {showUserPicker && (
            <View className="bg-white border border-gray-300 rounded-lg mb-4">
              {/* Info message about project filtering */}
              {formData.projectId && (
                <View className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <Text className="text-sm text-blue-700 ml-2 flex-1">
                    Only showing users assigned to the selected project
                  </Text>
                </View>
              )}
              
              <ScrollView className="max-h-48">
                {allAssignableUsers.length > 0 ? (
                  allAssignableUsers.map((assignableUser) => (
                    <Pressable
                      key={assignableUser.id}
                      onPress={() => toggleUserSelection(assignableUser.id)}
                      className="flex-row items-center p-3 border-b border-gray-100"
                    >
                      <View className={cn(
                        "w-5 h-5 border-2 rounded mr-3 items-center justify-center",
                        selectedUsers.includes(assignableUser.id) 
                          ? "border-blue-600 bg-blue-600" 
                          : "border-gray-300"
                      )}>
                        {selectedUsers.includes(assignableUser.id) && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">
                          {assignableUser.name}
                        </Text>
                        <Text className="text-sm text-gray-600 capitalize">
                          {assignableUser.role}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <View className="p-6 items-center">
                    <Ionicons name="people-outline" size={48} color="#d1d5db" />
                    <Text className="text-gray-500 mt-3 text-center">
                      No users assigned to this project yet
                    </Text>
                    <Text className="text-gray-400 text-sm text-center mt-1">
                      Assign users to the project first before creating tasks
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* Attachments */}
          <InputField label="Attachments" required={false}>
            <Pressable
              onPress={handlePickImages}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white items-center"
            >
              <Ionicons name="cloud-upload-outline" size={32} color="#6b7280" />
              <Text className="text-gray-600 mt-2">
                Tap to add photos or documents
              </Text>
            </Pressable>
          </InputField>

          {/* Attachment Preview */}
          {formData.attachments.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Selected Files ({formData.attachments.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {formData.attachments.map((_attachment, index) => (
                    <View key={index} className="mr-3 bg-white border border-gray-300 rounded-lg p-2 relative">
                      <Ionicons name="document-outline" size={24} color="#6b7280" />
                      <Pressable
                        onPress={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Bottom Spacing */}
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Priority Picker Modal */}
      <Modal
        visible={showPriorityPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPriorityPicker(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <StatusBar style="dark" />
          
          <ModalHandle />
          
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setShowPriorityPicker(false)}
              className="mr-4 w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-semibold text-gray-900 flex-1">
              Select Priority
            </Text>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {(["low", "medium", "high", "critical"] as Priority[]).map((priority) => (
              <Pressable
                key={priority}
                onPress={() => {
                  handlePriorityChange(priority);
                  setShowPriorityPicker(false);
                }}
                className={cn(
                  "bg-white border rounded-lg px-4 py-4 mb-3 flex-row items-center",
                  formData.priority === priority ? "border-blue-500 bg-blue-50" : "border-gray-300"
                )}
              >
                <View className={cn(
                  "w-5 h-5 rounded-full border-2 items-center justify-center mr-3",
                  formData.priority === priority ? "border-blue-500" : "border-gray-300"
                )}>
                  {formData.priority === priority && (
                    <View className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </View>
                <Text className={cn(
                  "font-semibold capitalize flex-1",
                  formData.priority === priority ? "text-blue-900" : "text-gray-900"
                )}>
                  {priority}
                </Text>
                <Ionicons 
                  name={priority === "critical" ? "alert-circle" : priority === "high" ? "arrow-up-circle" : priority === "medium" ? "remove-circle" : "arrow-down-circle"} 
                  size={24} 
                  color={formData.priority === priority ? "#3b82f6" : "#6b7280"} 
                />
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <StatusBar style="dark" />
          
          <ModalHandle />
          
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setShowCategoryPicker(false)}
              className="mr-4 w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-semibold text-gray-900 flex-1">
              Select Category
            </Text>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {(["general", "safety", "electrical", "plumbing", "structural", "materials"] as TaskCategory[]).map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  handleCategoryChange(category);
                  setShowCategoryPicker(false);
                }}
                className={cn(
                  "bg-white border rounded-lg px-4 py-4 mb-3 flex-row items-center",
                  formData.category === category ? "border-blue-500 bg-blue-50" : "border-gray-300"
                )}
              >
                <View className={cn(
                  "w-5 h-5 rounded-full border-2 items-center justify-center mr-3",
                  formData.category === category ? "border-blue-500" : "border-gray-300"
                )}>
                  {formData.category === category && (
                    <View className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </View>
                <Text className={cn(
                  "font-semibold capitalize flex-1",
                  formData.category === category ? "text-blue-900" : "text-gray-900"
                )}>
                  {category}
                </Text>
                <Ionicons 
                  name={
                    category === "safety" ? "shield-checkmark" :
                    category === "electrical" ? "flash" :
                    category === "plumbing" ? "water" :
                    category === "structural" ? "hammer" :
                    category === "materials" ? "cube" :
                    "list"
                  } 
                  size={24} 
                  color={formData.category === category ? "#3b82f6" : "#6b7280"} 
                />
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Project Picker Modal */}
      <Modal
        visible={showProjectPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <StatusBar style="dark" />
          
          <ModalHandle />
          
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setShowProjectPicker(false)}
              className="mr-4 w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-semibold text-gray-900 flex-1">
              Select Project
            </Text>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {userProjects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => {
                  setFormData(prev => ({ ...prev, projectId: project.id }));
                  setShowProjectPicker(false);
                }}
                className={cn(
                  "bg-white border rounded-lg px-4 py-4 mb-3 flex-row items-center",
                  formData.projectId === project.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
                )}
              >
                <View className={cn(
                  "w-5 h-5 rounded-full border-2 items-center justify-center mr-3",
                  formData.projectId === project.id ? "border-blue-500" : "border-gray-300"
                )}>
                  {formData.projectId === project.id && (
                    <View className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={cn(
                    "font-semibold",
                    formData.projectId === project.id ? "text-blue-900" : "text-gray-900"
                  )} numberOfLines={1}>
                    {project.name}
                  </Text>
                  <Text className="text-xs text-gray-600 mt-0.5" numberOfLines={1}>
                    {project.location.city}, {project.location.state}
                  </Text>
                </View>
                <Ionicons name="folder-outline" size={24} color={formData.projectId === project.id ? "#3b82f6" : "#6b7280"} />
              </Pressable>
            ))}
            
            {userProjects.length === 0 && (
              <View className="bg-white border border-gray-200 rounded-lg p-8 items-center">
                <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 text-center mt-2">
                  No projects available
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}