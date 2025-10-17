import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Alert, View } from "react-native";
import { useAuthStore } from "../state/authStore";
import { useTaskStore } from "../state/taskStore";
import { DataRefreshManager } from "../utils/DataRefreshManager";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import TasksScreen from "../screens/TasksScreen";
import ProjectsTasksScreen from "../screens/ProjectsTasksScreen";
import CreateTaskScreen from "../screens/CreateTaskScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TaskDetailScreen from "../screens/TaskDetailScreen";
import ReportsScreen from "../screens/ReportsScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import CreateProjectScreen from "../screens/CreateProjectScreen";
import UserManagementScreen from "../screens/UserManagementScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



// Auth screens component
function AuthScreens() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <RegisterScreen 
        onToggleLogin={() => setShowRegister(false)} 
      />
    );
  }

  return (
    <LoginScreen 
      onToggleRegister={() => setShowRegister(true)} 
    />
  );
}

// Dashboard Stack to handle navigation to other screens
function DashboardStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: "card"
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardMainScreen} />
    </Stack.Navigator>
  );
}

function DashboardMainScreen({ navigation }: { navigation: any }) {
  return (
    <DashboardScreen
      onNavigateToTasks={() => navigation.getParent()?.navigate("Tasks")}
      onNavigateToCreateTask={() => navigation.getParent()?.navigate("CreateTask")}
      onNavigateToProfile={() => navigation.getParent()?.navigate("Profile")}
      onNavigateToReports={() => navigation.getParent()?.navigate("Reports")}
    />
  );
}

// Tasks Stack Navigator to include Task Detail screen
function TasksStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: "card"
      }}
    >
      <Stack.Screen name="TasksList" component={ProjectsTasksListScreen} />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreenWrapper}
        options={{
          presentation: "modal"
        }}
      />
    </Stack.Navigator>
  );
}

function ProjectsTasksListScreen({ navigation }: { navigation: any }) {
  return (
    <ProjectsTasksScreen
      onNavigateToTaskDetail={(taskId: string, subTaskId?: string) => {
        navigation.navigate("TaskDetail", { taskId, subTaskId });
      }}
      onNavigateToCreateTask={() => navigation.getParent()?.navigate("CreateTask")}
    />
  );
}

function TaskDetailScreenWrapper({ route, navigation }: { route: any; navigation: any }) {
  const { taskId, subTaskId } = route.params;
  return (
    <TaskDetailScreen
      taskId={taskId}
      subTaskId={subTaskId}
      onNavigateBack={() => navigation.goBack()}
    />
  );
}

// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileMainScreen} />
    </Stack.Navigator>
  );
}

function ProfileMainScreen({ navigation }: { navigation: any }) {
  return (
    <ProfileScreen
      onNavigateBack={() => navigation.goBack()}
    />
  );
}

// Reports Stack
function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportsMain" component={ReportsMainScreen} />
    </Stack.Navigator>
  );
}

function ReportsMainScreen({ navigation }: { navigation: any }) {
  return (
    <ReportsScreen
      onNavigateBack={() => navigation.goBack()}
    />
  );
}

// Create Task Stack
function CreateTaskStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateTaskMain" component={CreateTaskMainScreen} />
    </Stack.Navigator>
  );
}

function CreateTaskMainScreen({ navigation }: { navigation: any }) {
  return (
    <CreateTaskScreen
      onNavigateBack={() => navigation.goBack()}
    />
  );
}

// Admin Dashboard Stack
function AdminDashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboardMain" component={AdminDashboardMainScreen} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="CreateProject" component={CreateProjectMainScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementMainScreen} />
    </Stack.Navigator>
  );
}

function AdminDashboardMainScreen({ navigation }: { navigation: any }) {
  return (
    <AdminDashboardScreen
      onNavigateToProjects={() => navigation.navigate("ProjectsList")}
      onNavigateToUserManagement={() => navigation.navigate("UserManagement")}
      onNavigateToProfile={() => navigation.getParent()?.navigate("Profile")}
    />
  );
}

// Projects Stack (Admin Only) - Kept for backwards compatibility
function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="CreateProject" component={CreateProjectMainScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementMainScreen} />
    </Stack.Navigator>
  );
}

// Projects Stack for Non-Admin Users
function UserProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
    </Stack.Navigator>
  );
}

function ProjectsListScreen({ navigation }: { navigation: any }) {
  return (
    <ProjectsScreen
      onNavigateToProjectDetail={(projectId: string) => {
        // For now, show alert - we'll implement project detail later
        Alert.alert("Project Details", `Project ${projectId} details would open here.`);
      }}
      onNavigateToCreateProject={() => navigation.navigate("CreateProject")}
      onNavigateToUserManagement={() => navigation.navigate("UserManagement")}
    />
  );
}

function CreateProjectMainScreen({ navigation }: { navigation: any }) {
  return (
    <CreateProjectScreen
      onNavigateBack={() => navigation.goBack()}
    />
  );
}

function UserManagementMainScreen({ navigation }: { navigation: any }) {
  return (
    <UserManagementScreen
      onNavigateBack={() => navigation.goBack()}
    />
  );
}

// Main Tab Navigator
function MainTabs() {
  const { user } = useAuthStore();
  const getUnreadTaskCount = useTaskStore(state => state.getUnreadTaskCount);
  
  // Get unread task count for badge
  const unreadCount = user ? getUnreadTaskCount(user.id) : 0;
  const badgeCount = unreadCount > 99 ? '99+' : (unreadCount > 0 ? unreadCount : undefined);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#e5e7eb",
          paddingBottom: 8,
          paddingTop: 8,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      {user?.role !== "admin" && (
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      {user?.role === "admin" ? (
        <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboardStack}
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="apps-outline" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="Tasks"
          component={TasksStack}
          options={{
            tabBarLabel: "Works",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="hammer-outline" size={size} color={color} />
            ),
            tabBarBadge: badgeCount,
            tabBarBadgeStyle: { backgroundColor: '#ef4444', color: 'white', fontSize: 10 },
          }}
        />
      )}
      {user?.role !== "admin" && (
        <Tab.Screen
          name="CreateTask"
          component={CreateTaskStack}
          options={{
            tabBarLabel: "New",
            tabBarIcon: ({ focused }) => (
              <View style={{ marginTop: -5 }}>
                <Ionicons 
                  name="add-circle" 
                  size={32} 
                  color="#f97316" 
                />
              </View>
            ),
          }}
        />
      )}
      {user?.role !== "admin" && (
        <Tab.Screen
          name="Reports"
          component={ReportsStack}
          options={{
            tabBarLabel: "Reports",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    // TODO: Add proper loading screen
    return null;
  }

  if (!isAuthenticated) {
    return <AuthScreens />;
  }

  return (
    <NavigationContainer>
      <DataRefreshManager />
      <MainTabs />
    </NavigationContainer>
  );
}// Force reload Fri Oct  3 06:16:45 UTC 2025
