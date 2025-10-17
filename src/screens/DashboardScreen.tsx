import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useTaskStoreWithInit } from "../state/taskStore";
import { useProjectStoreWithInit } from "../state/projectStore";
import { useProjectFilterStore } from "../state/projectFilterStore";
import { useCompanyStore } from "../state/companyStore";
import { useTranslation } from "../utils/useTranslation";
import { Task, Priority, SubTask } from "../types/buildtrack";
import { cn } from "../utils/cn";
import CompanyBanner from "../components/CompanyBanner";
import { checkSupabaseConnection } from "../api/supabase";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { detectEnvironment, getEnvironmentStyles } from "../utils/environmentDetector";

interface DashboardScreenProps {
  onNavigateToTasks: () => void;
  onNavigateToCreateTask: () => void;
  onNavigateToProfile: () => void;
  onNavigateToReports?: () => void;
}

export default function DashboardScreen({ 
  onNavigateToTasks, 
  onNavigateToCreateTask, 
  onNavigateToProfile,
  onNavigateToReports
}: DashboardScreenProps) {
  const { user } = useAuthStore();
  const taskStore = useTaskStoreWithInit();
  const tasks = taskStore.tasks;
  const projectStore = useProjectStoreWithInit();
  const { getProjectsByUser, getProjectById, fetchProjects, fetchUserProjectAssignments } = projectStore;
  const { selectedProjectId, setSelectedProject } = useProjectFilterStore();
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<"my_tasks" | "inbox_tasks" | "outbox_tasks" | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [environmentInfo] = useState(() => detectEnvironment());
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkAnimation = useRef(new Animated.Value(1)).current;
  const t = useTranslation();

  // Blinking animation function
  const triggerBlinkingAnimation = () => {
    setIsBlinking(true);
    
    // Create blinking animation
    const blinkSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 5 } // Blink 5 times (3 seconds total)
    );

    blinkSequence.start(() => {
      // Animation completed
      setIsBlinking(false);
      blinkAnimation.setValue(1);
    });
  };

  // Manual refresh function
  const handleRefresh = async () => {
    if (!user) return;
    
    console.log('🔄 Manual refresh triggered from Dashboard...');
    
    // Trigger blinking animation when starting data fetch
    triggerBlinkingAnimation();
    
    try {
      await Promise.all([
        fetchProjects(),
        fetchUserProjectAssignments(user.id),
        taskStore.fetchTasks()
      ]);
      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    }
  };

  // Check Supabase connection and refresh data on component mount
  useEffect(() => {
    const checkConnectionAndRefresh = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        setSupabaseStatus(isConnected ? "connected" : "disconnected");
        
        if (isConnected && user) {
          console.log('🔄 Auto-refreshing data on Dashboard mount...');
          // Trigger blinking animation for auto-refresh
          triggerBlinkingAnimation();
          await handleRefresh();
        }
      } catch (error) {
        console.error("Supabase connection check failed:", error);
        setSupabaseStatus("disconnected");
      }
    };
    
    checkConnectionAndRefresh();
  }, [user]);

  if (!user) return null;


  // Get projects user is participating in
  const userProjects = getProjectsByUser(user.id);
  const activeProjects = userProjects.filter(p => p.status === "active");
  const planningProjects = userProjects.filter(p => p.status === "planning");
  
  // Get selected project name for display
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;

  // Filter tasks by selected project FIRST (same as TasksScreen)
  const projectFilteredTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks;

  // Helper function to recursively collect all subtasks assigned by a user
  const collectSubTasksAssignedBy = (subTasks: SubTask[] | undefined, userId: string): SubTask[] => {
    if (!subTasks) return [];
    
    const result: SubTask[] = [];
    for (const subTask of subTasks) {
      if (subTask.assignedBy === userId) {
        result.push(subTask);
      }
      // Recursively collect from nested subtasks
      if (subTask.subTasks) {
        result.push(...collectSubTasksAssignedBy(subTask.subTasks, userId));
      }
    }
    return result;
  };

  // Helper function to recursively collect all subtasks assigned to a user
  const collectSubTasksAssignedTo = (subTasks: SubTask[] | undefined, userId: string): SubTask[] => {
    if (!subTasks) return [];
    
    const result: SubTask[] = [];
    for (const subTask of subTasks) {
      const assignedTo = subTask.assignedTo || [];
      if (Array.isArray(assignedTo) && assignedTo.includes(userId)) {
        result.push(subTask);
      }
      // Recursively collect from nested subtasks
      if (subTask.subTasks) {
        result.push(...collectSubTasksAssignedTo(subTask.subTasks, userId));
      }
    }
    return result;
  };

  // Section 1: My Tasks - Tasks I assigned to myself (my own to-do list)
  // These are tasks where I am both the creator AND the assignee
  const myTasks = projectFilteredTasks.filter(task => {
    const assignedTo = task.assignedTo || [];
    const isAssignedToMe = Array.isArray(assignedTo) && assignedTo.includes(user.id);
    const isCreatedByMe = task.assignedBy === user.id;
    
    return isCreatedByMe && isAssignedToMe;
  });

  const mySubTasks = projectFilteredTasks.flatMap(task => {
    // Only include subtasks that are created by me AND assigned to me
    return collectSubTasksAssignedTo(task.subTasks, user.id)
      .filter(subTask => subTask.assignedBy === user.id)
      .map(subTask => ({ ...subTask, isSubTask: true as const }));
  });

  const myAllTasks = [...myTasks, ...mySubTasks];
  
  const myNotStartedTasks = myAllTasks.filter(task => task.currentStatus === "not_started");
  const myInProgressTasks = myAllTasks.filter(task => task.currentStatus === "in_progress");
  const myCompletedTasks = myAllTasks.filter(task => task.currentStatus === "completed");
  const myBlockedTasks = myAllTasks.filter(task => task.currentStatus === "blocked");

  // Section 2: Inbox - Tasks assigned to me by others (need acceptance)
  // These are tasks where others assigned them to me, but I didn't create them
  const inboxTasks = projectFilteredTasks.filter(task => {
    const assignedTo = task.assignedTo || [];
    const isAssignedToMe = Array.isArray(assignedTo) && assignedTo.includes(user.id);
    const isCreatedByMe = task.assignedBy === user.id;
    
    // Include if assigned to me but NOT created by me
    return isAssignedToMe && !isCreatedByMe;
  });

  const inboxSubTasks = projectFilteredTasks.flatMap(task => {
    // Only include subtasks assigned to me but NOT created by me
    return collectSubTasksAssignedTo(task.subTasks, user.id)
      .filter(subTask => subTask.assignedBy !== user.id)
      .map(subTask => ({ ...subTask, isSubTask: true as const }));
  });

  const inboxAllTasks = [...inboxTasks, ...inboxSubTasks];
  
  const inboxNotStartedTasks = inboxAllTasks.filter(task => task.currentStatus === "not_started");
  const inboxInProgressTasks = inboxAllTasks.filter(task => task.currentStatus === "in_progress");
  const inboxCompletedTasks = inboxAllTasks.filter(task => task.currentStatus === "completed");
  const inboxBlockedTasks = inboxAllTasks.filter(task => task.currentStatus === "blocked");
  
  // Section 3: Outbox - Tasks I assigned to others
  // These are tasks where I created them and assigned them to others (not myself)
  const outboxTasks = projectFilteredTasks.filter(task => {
    const assignedTo = task.assignedTo || [];
    const isAssignedToMe = Array.isArray(assignedTo) && assignedTo.includes(user.id);
    const isCreatedByMe = task.assignedBy === user.id;
    
    // Include if created by me but NOT assigned to me (assigned to others)
    return isCreatedByMe && !isAssignedToMe;
  });

  const outboxSubTasks = projectFilteredTasks.flatMap(task => {
    // Only include subtasks created by me but NOT assigned to me
    return collectSubTasksAssignedBy(task.subTasks, user.id)
      .filter(subTask => {
        const assignedTo = subTask.assignedTo || [];
        return !Array.isArray(assignedTo) || !assignedTo.includes(user.id);
      })
      .map(subTask => ({ ...subTask, isSubTask: true as const }));
  });

  const outboxAllTasks = [...outboxTasks, ...outboxSubTasks];
  
  const outboxNotStartedTasks = outboxAllTasks.filter(task => task.currentStatus === "not_started");
  const outboxInProgressTasks = outboxAllTasks.filter(task => task.currentStatus === "in_progress");
  const outboxCompletedTasks = outboxAllTasks.filter(task => task.currentStatus === "completed");
  const outboxBlockedTasks = outboxAllTasks.filter(task => task.currentStatus === "blocked");

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-50";
      case "high": return "text-orange-600 bg-orange-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in_progress": return "text-blue-600";
      case "blocked": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const StatCard = ({ 
    title, 
    count, 
    icon, 
    color = "bg-blue-50", 
    iconColor = "#3b82f6",
    onPress 
  }: {
    title: string;
    count: number;
    icon: string;
    color?: string;
    iconColor?: string;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className={cn("flex-1 p-4 rounded-xl", color)}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <Text className="text-2xl font-bold text-gray-900">{count}</Text>
      </View>
      <Text className="text-sm text-gray-600">{title}</Text>
    </Pressable>
  );

  const TaskPreviewCard = ({ task }: { task: Task }) => (
    <Pressable className="bg-white border border-gray-200 rounded-lg p-5 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-lg mb-2" numberOfLines={2}>
            {task.title}
          </Text>
          <Text className="text-base text-gray-600" numberOfLines={2}>
            {task.description}
          </Text>
        </View>
        <View className={cn("px-4 py-2 rounded ml-3", getPriorityColor(task.priority))}>
          <Text className="text-sm font-bold capitalize">
            {task.priority}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons 
            name="time-outline" 
            size={20} 
            color="#6b7280" 
          />
          <Text className="text-sm text-gray-500 ml-2 font-semibold">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-gray-300 mr-2" />
          <Text className={cn("text-sm font-bold capitalize", getStatusColor(task.currentStatus))}>
            {task.currentStatus.replace("_", " ")}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-600 font-semibold">Progress</Text>
          <Text className="text-sm text-gray-600 font-bold">{task.completionPercentage}%</Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-3">
          <View 
            className="bg-blue-600 h-3 rounded-full" 
            style={{ width: `${task.completionPercentage}%` }}
          />
        </View>
      </View>
    </Pressable>
  );

  const CompactTaskCard = ({ task }: { task: Task }) => (
    <Pressable className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
      {/* Line 1: Title and Priority */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-900 text-sm flex-1 mr-2" numberOfLines={1}>
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
          <Text className="text-xs text-gray-600 ml-1">
            {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        </View>
        <Text className={cn("text-xs font-medium capitalize", getStatusColor(task.currentStatus))}>
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <LoadingIndicator 
        isLoading={projectStore.isLoading || taskStore.isLoading} 
        text="Syncing data..." 
      />
      
      {/* Combined Company Banner + Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        {(() => {
          const banner = useCompanyStore.getState().getCompanyBanner(user.companyId);
          if (banner && banner.isVisible) {
            return (
              <View className="mb-2">
                {banner.imageUri ? (
                  // Display image banner
                  <Image
                    source={{ uri: banner.imageUri }}
                    style={{ width: '100%', height: 60 }}
                    resizeMode="cover"
                    className="rounded-lg"
                  />
                ) : (
                  // Display text banner
                  <Text 
                    style={{ 
                      color: banner.textColor,
                      fontSize: 18, // Consistent with main title
                      fontWeight: '700',
                    }}
                    numberOfLines={1}
                  >
                    {banner.text}
                  </Text>
                )}
              </View>
            );
          }
          return null;
        })()}
        
        {/* Screen Title */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            {t.nav.dashboard}
          </Text>
          
          {/* Environment and Connection Status */}
          <View className="flex-row items-center space-x-3">
            {/* Environment Indicator */}
            <View className="flex-row items-center">
              <View 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getEnvironmentStyles(environmentInfo).backgroundColor }}
              />
              <Text className="text-xs font-medium text-gray-700">
                {environmentInfo.displayName}
              </Text>
            </View>
            
            {/* Supabase Connection Status */}
            <View className="flex-row items-center">
              <Animated.View 
                className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  supabaseStatus === "connected" ? "bg-green-500" :
                  supabaseStatus === "disconnected" ? "bg-red-500" :
                  "bg-yellow-500"
                )}
                style={{
                  opacity: blinkAnimation,
                }}
              />
              <Text className={cn(
                "text-xs font-medium",
                supabaseStatus === "connected" ? "text-green-700" :
                supabaseStatus === "disconnected" ? "text-red-700" :
                "text-yellow-700"
              )}>
                {supabaseStatus === "connected" ? "Cloud" :
                 supabaseStatus === "disconnected" ? "Offline" :
                 "Checking..."}
              </Text>
            </View>
            
            {/* Refresh Button - Moved to rightmost position */}
            <Pressable 
              onPress={handleRefresh}
              className="bg-blue-500 rounded-full p-2"
            >
              <Ionicons name="refresh" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Project Filter Picker */}
        <View className="px-6 pt-4 pb-2">
          <Pressable
            onPress={() => setShowProjectPicker(true)}
            className="bg-white border-2 border-blue-600 rounded-lg px-4 py-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="business-outline" size={28} color="#3b82f6" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                  {selectedProject ? selectedProject.name : `${t.dashboard.allProjects} (${userProjects.length})`}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={28} color="#6b7280" />
          </Pressable>
        </View>
        
        {/* Quick Overview */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            {t.dashboard.quickOverview}
          </Text>

          {/* Section 1: My Tasks - Tasks I assigned to myself (my own to-do list) */}
          {myAllTasks.length > 0 && (
            <View className="mb-2">
              {/* Stacked Bar Chart with title inside */}
              <View className="bg-white rounded-lg p-3 border border-gray-200">
                {/* Title inside the card */}
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle-outline" size={18} color="#10b981" />
                  <Text className="text-sm font-semibold text-gray-900 ml-2">
                    My Tasks ({myAllTasks.length})
                  </Text>
                </View>
                {/* Bar */}
                <View className="flex-row h-8 rounded-lg overflow-hidden">
                  {myAllTasks.length > 0 ? (
                    <>
                      {/* Not Started - Gray */}
                      {myNotStartedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "not_started" && selectedSection === "my_tasks" ? "bg-gray-500" : "bg-gray-400")}
                          style={{ width: `${(myNotStartedTasks.length / myAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("not_started");
                            setSelectedSection("my_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{myNotStartedTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* In Progress - Blue */}
                      {myInProgressTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "in_progress" && selectedSection === "my_tasks" ? "bg-blue-600" : "bg-blue-500")}
                          style={{ width: `${(myInProgressTasks.length / myAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("in_progress");
                            setSelectedSection("my_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{myInProgressTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* Completed - Green */}
                      {myCompletedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "completed" && selectedSection === "my_tasks" ? "bg-green-600" : "bg-green-500")}
                          style={{ width: `${(myCompletedTasks.length / myAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("completed");
                            setSelectedSection("my_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{myCompletedTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* Blocked - Red */}
                      {myBlockedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "blocked" && selectedSection === "my_tasks" ? "bg-red-600" : "bg-red-500")}
                          style={{ width: `${(myBlockedTasks.length / myAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("blocked");
                            setSelectedSection("my_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{myBlockedTasks.length}</Text>
                        </Pressable>
                      )}
                    </>
                  ) : (
                    <View className="bg-gray-200 flex-1" />
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Section 2: Inbox - Tasks assigned to me by others (need acceptance) */}
          {inboxAllTasks.length > 0 && (
            <View className="mb-2">
              {/* Stacked Bar Chart with title inside */}
              <View className="bg-white rounded-lg p-3 border border-gray-200">
                {/* Title inside the card */}
                <View className="flex-row items-center mb-3">
                  <Ionicons name="mail-outline" size={18} color="#3b82f6" />
                  <Text className="text-sm font-semibold text-gray-900 ml-2">
                    Inbox ({inboxAllTasks.length})
                  </Text>
                </View>
                
                {/* Bar */}
                <View className="flex-row h-8 rounded-lg overflow-hidden">
                  {inboxAllTasks.length > 0 ? (
                    <>
                      {/* Not Started - Gray */}
                      {inboxNotStartedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "not_started" && selectedSection === "inbox_tasks" ? "bg-gray-500" : "bg-gray-400")}
                          style={{ width: `${(inboxNotStartedTasks.length / inboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("not_started");
                            setSelectedSection("inbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{inboxNotStartedTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* In Progress - Blue */}
                      {inboxInProgressTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "in_progress" && selectedSection === "inbox_tasks" ? "bg-blue-600" : "bg-blue-500")}
                          style={{ width: `${(inboxInProgressTasks.length / inboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("in_progress");
                            setSelectedSection("inbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{inboxInProgressTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* Completed - Green */}
                      {inboxCompletedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "completed" && selectedSection === "inbox_tasks" ? "bg-green-600" : "bg-green-500")}
                          style={{ width: `${(inboxCompletedTasks.length / inboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("completed");
                            setSelectedSection("inbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{inboxCompletedTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* Blocked - Red */}
                      {inboxBlockedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "blocked" && selectedSection === "inbox_tasks" ? "bg-red-600" : "bg-red-500")}
                          style={{ width: `${(inboxBlockedTasks.length / inboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("blocked");
                            setSelectedSection("inbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{inboxBlockedTasks.length}</Text>
                        </Pressable>
                      )}
                    </>
                  ) : (
                    <View className="bg-gray-200 flex-1" />
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Section 3: Outbox - Tasks I assigned to others */}
          {outboxAllTasks.length > 0 && (
            <View className="mb-2">
              {/* Stacked Bar Chart with title inside */}
              <View className="bg-white rounded-lg p-3 border border-gray-200">
                {/* Title inside the card */}
                <View className="flex-row items-center mb-3">
                  <Ionicons name="send-outline" size={18} color="#7c3aed" />
                  <Text className="text-sm font-semibold text-gray-900 ml-2">
                    Outbox ({outboxAllTasks.length})
                  </Text>
                </View>
                {/* Bar */}
                <View className="flex-row h-8 rounded-lg overflow-hidden">
                  {outboxAllTasks.length > 0 ? (
                    <>
                      {/* Not Started - Gray */}
                      {outboxNotStartedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "not_started" && selectedSection === "outbox_tasks" ? "bg-gray-500" : "bg-gray-400")}
                          style={{ width: `${(outboxNotStartedTasks.length / outboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("not_started");
                            setSelectedSection("outbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{outboxNotStartedTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* In Progress - Blue */}
                      {outboxInProgressTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "in_progress" && selectedSection === "outbox_tasks" ? "bg-blue-600" : "bg-blue-500")}
                          style={{ width: `${(outboxInProgressTasks.length / outboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("in_progress");
                            setSelectedSection("outbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{outboxInProgressTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* Completed - Green */}
                      {outboxCompletedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "completed" && selectedSection === "outbox_tasks" ? "bg-green-600" : "bg-green-500")}
                          style={{ width: `${(outboxCompletedTasks.length / outboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("completed");
                            setSelectedSection("outbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{outboxCompletedTasks.length}</Text>
                        </Pressable>
                      )}
                      {/* Blocked - Red */}
                      {outboxBlockedTasks.length > 0 && (
                        <Pressable 
                          className={cn("items-center justify-center", selectedStatus === "blocked" && selectedSection === "outbox_tasks" ? "bg-red-600" : "bg-red-500")}
                          style={{ width: `${(outboxBlockedTasks.length / outboxAllTasks.length) * 100}%` }}
                          onPress={() => {
                            setSelectedStatus("blocked");
                            setSelectedSection("outbox_tasks");
                            setShowTasksModal(true);
                          }}
                        >
                          <Text className="text-white text-xs font-bold">{outboxBlockedTasks.length}</Text>
                        </Pressable>
                      )}
                    </>
                  ) : (
                    <View className="bg-gray-200 flex-1" />
                  )}
                </View>
              </View>
            </View>
          )}
          
          {/* Shared Legend */}
          <View className="flex-row justify-center items-center">
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 bg-gray-400 rounded mr-2" />
              <Text className="text-sm text-gray-700">{t.dashboard.notStarted}</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 bg-blue-500 rounded mr-2" />
              <Text className="text-sm text-gray-700">{t.dashboard.inProgress}</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 bg-green-500 rounded mr-2" />
              <Text className="text-sm text-gray-700">{t.dashboard.completed}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-red-500 rounded mr-2" />
              <Text className="text-sm text-gray-700">Blocked</Text>
        </View>
          </View>
        </View>

      </ScrollView>

      {/* Tasks Filter Modal */}
      <Modal
        visible={showTasksModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTasksModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <StatusBar style="dark" />
          
          {/* Modal Header */}
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setShowTasksModal(false)}
              className="mr-4 w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {selectedStatus && `${selectedStatus.replace("_", " ").charAt(0).toUpperCase() + selectedStatus.replace("_", " ").slice(1)} Tasks`}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {selectedSection === "my_tasks" ? "My Tasks (Self-Assigned)" : 
                 selectedSection === "inbox_tasks" ? "Inbox (Assigned to Me by Others)" : 
                 selectedSection === "outbox_tasks" ? "Outbox (Assigned to Others)" : 
                 "Tasks"}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {(() => {
              // Filter from the appropriate task list based on which section was clicked
              const sourceTaskList = selectedSection === "my_tasks" ? myAllTasks : 
                                   selectedSection === "inbox_tasks" ? inboxAllTasks : 
                                   selectedSection === "outbox_tasks" ? outboxAllTasks : 
                                   [];
              const filteredTasks = sourceTaskList.filter(task => task.currentStatus === selectedStatus);
              
              return filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <CompactTaskCard key={task.id} task={task} />
                ))
              ) : (
                <View className="bg-white border border-gray-200 rounded-lg p-8 items-center mt-8">
                  <Ionicons name="clipboard-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 text-center mt-2">
                    No {selectedStatus?.replace("_", " ")} tasks
                  </Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Try selecting a different status
                  </Text>
                </View>
              );
            })()}
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
          
          {/* Modal Header */}
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setShowProjectPicker(false)}
              className="mr-4 w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              {t.dashboard.selectProject}
            </Text>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* All Projects Option */}
            <Pressable
              onPress={() => {
                setSelectedProject(null);
                setShowProjectPicker(false);
              }}
              className={cn(
                "bg-white border rounded-lg px-4 py-4 mb-3 flex-row items-center",
                selectedProjectId === null ? "border-blue-500 bg-blue-50" : "border-gray-300"
              )}
            >
              <View className={cn(
                "w-5 h-5 rounded-full border-2 items-center justify-center mr-3",
                selectedProjectId === null ? "border-blue-500" : "border-gray-300"
              )}>
                {selectedProjectId === null && (
                  <View className="w-3 h-3 rounded-full bg-blue-500" />
                )}
              </View>
              <View className="flex-1">
                <Text className={cn(
                  "text-sm font-semibold",
                  selectedProjectId === null ? "text-blue-900" : "text-gray-900"
                )}>
                  {t.dashboard.allProjects} ({userProjects.length})
                </Text>
                <Text className="text-xs text-gray-600 mt-0.5">
                  {t.dashboard.viewTasks}
                </Text>
              </View>
              <Ionicons name="apps-outline" size={24} color={selectedProjectId === null ? "#3b82f6" : "#6b7280"} />
            </Pressable>

            {/* Individual Projects */}
            <Text className="text-xs font-semibold text-gray-500 uppercase mb-2 mt-2">
              {t.dashboard.yourProjects} ({userProjects.length})
            </Text>
            
            {userProjects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => {
                  setSelectedProject(project.id);
                  setShowProjectPicker(false);
                }}
                className={cn(
                  "bg-white border rounded-lg px-4 py-4 mb-3 flex-row items-center",
                  selectedProjectId === project.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
                )}
              >
                <View className={cn(
                  "w-5 h-5 rounded-full border-2 items-center justify-center mr-3",
                  selectedProjectId === project.id ? "border-blue-500" : "border-gray-300"
                )}>
                  {selectedProjectId === project.id && (
                    <View className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={cn(
                    "text-sm font-semibold",
                    selectedProjectId === project.id ? "text-blue-900" : "text-gray-900"
                  )} numberOfLines={1}>
                    {project.name}
                  </Text>
                  <Text className="text-xs text-gray-600 mt-0.5" numberOfLines={1}>
                    {project.location.city}, {project.location.state} • {project.status}
                  </Text>
                </View>
                <Ionicons name="folder-outline" size={24} color={selectedProjectId === project.id ? "#3b82f6" : "#6b7280"} />
              </Pressable>
            ))}
            
            {userProjects.length === 0 && (
              <View className="bg-white border border-gray-200 rounded-lg p-8 items-center">
                <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 text-center mt-2">
                  {t.dashboard.noTasksYet}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
// Force reload 1759505832
// Force reload: 1759506479
// Force reload: 1759506549
