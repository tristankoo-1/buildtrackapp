import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useProjectStore } from "../state/projectStore";
import { useUserStore } from "../state/userStore";
import { useCompanyStore } from "../state/companyStore";
import { User, Project, UserCategory } from "../types/buildtrack";
import { cn } from "../utils/cn";
import StandardHeader from "../components/StandardHeader";
import ModalHandle from "../components/ModalHandle";
import { notifyDataMutation } from "../utils/DataRefreshManager";

interface UserManagementScreenProps {
  onNavigateBack: () => void;
}

export default function UserManagementScreen({ onNavigateBack }: UserManagementScreenProps) {
  const { user: currentUser } = useAuthStore();
  const { getAllProjects, assignUserToProject, removeUserFromProject, getUserProjectAssignments } = useProjectStore();
  const { getUsersByCompany, getAdminCountByCompany } = useUserStore();
  const { getCompanyById, getCompanyBanner } = useCompanyStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<UserCategory>("worker");
  const [activeModal, setActiveModal] = useState<'assign' | 'project' | 'category' | 'success' | 'removeConfirm' | 'invite' | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [removeData, setRemoveData] = useState<{userId: string, projectId: string, userName: string, projectName: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Access denied. Admin role required.</Text>
          <Pressable onPress={onNavigateBack} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg">
            <Text className="text-white">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Only show users from the same company
  const companyUsers = currentUser.companyId 
    ? getUsersByCompany(currentUser.companyId)
    : [];
  const projects = getAllProjects();
  const currentCompany = currentUser.companyId ? getCompanyById(currentUser.companyId) : null;
  
  const filteredUsers = companyUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryColor = (category: UserCategory) => {
    const colors = {
      lead_project_manager: "bg-purple-50 text-purple-600 border-purple-200",
      contractor: "bg-blue-50 text-blue-600 border-blue-200", 
      subcontractor: "bg-green-50 text-green-600 border-green-200",
      inspector: "bg-red-50 text-red-600 border-red-200",
      architect: "bg-indigo-50 text-indigo-600 border-indigo-200",
      engineer: "bg-orange-50 text-orange-600 border-orange-200",
      worker: "bg-gray-50 text-gray-600 border-gray-200",
      foreman: "bg-yellow-50 text-yellow-600 border-yellow-200",
    };
    return colors[category] || colors.worker;
  };

  const getCategoryLabel = (category: UserCategory) => {
    const labels = {
      lead_project_manager: "Lead Project Manager",
      contractor: "Contractor",
      subcontractor: "Subcontractor", 
      inspector: "Inspector",
      architect: "Architect",
      engineer: "Engineer",
      worker: "Worker",
      foreman: "Foreman",
    };
    return labels[category] || category;
  };

  const handleAssignUser = () => {
    if (!selectedUser || !selectedProject) return;

    assignUserToProject(selectedUser.id, selectedProject.id, selectedCategory, currentUser.id);
    
    // Notify all users about the assignment
    notifyDataMutation('assignment');
    
    setSuccessMessage(`${selectedUser.name} has been assigned to ${selectedProject.name} as ${getCategoryLabel(selectedCategory)}.`);
    setActiveModal('success');
    
    setSelectedUser(null);
    setSelectedProject(null);
    setSelectedCategory("worker");
  };

  const handleRemoveUser = (userId: string, projectId: string, userName: string, projectName: string) => {
    setRemoveData({ userId, projectId, userName, projectName });
    setActiveModal('removeConfirm');
  };

  const confirmRemoveUser = () => {
    if (!removeData) return;
    
    removeUserFromProject(removeData.userId, removeData.projectId);
    
    // Notify all users about the removal
    notifyDataMutation('assignment');
    
    setSuccessMessage(`${removeData.userName} has been removed from ${removeData.projectName}.`);
    setActiveModal('success');
    setRemoveData(null);
  };

  const UserCard = ({ user }: { user: User }) => {
    const userAssignments = getUserProjectAssignments(user.id);
    const { getAdminCountByCompany } = useUserStore();
    const isLastAdmin = user.role === "admin" && getAdminCountByCompany(user.companyId) === 1;
    
    return (
      <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        {/* User Info */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-semibold text-gray-900 text-base">
                {user.name}
              </Text>
              {user.role === "admin" && (
                <View className="bg-purple-100 px-2 py-1 rounded">
                  <Text className="text-purple-700 text-xs font-bold">ADMIN</Text>
                </View>
              )}
              {isLastAdmin && (
                <View className="bg-amber-100 px-2 py-1 rounded flex-row items-center">
                  <Ionicons name="shield-checkmark" size={12} color="#d97706" />
                  <Text className="text-amber-700 text-xs font-bold ml-1">Protected</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-gray-600">
              {user.email}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              <Text className="text-xs text-gray-500 ml-1 capitalize">
                {user.role} • {user.position}
              </Text>
            </View>
          </View>
          
          <Pressable
            onPress={() => {
              setSelectedUser(user);
              setActiveModal('assign');
            }}
            className="px-3 py-2 bg-blue-600 rounded-lg"
          >
            <Text className="text-white text-xs font-medium">Assign</Text>
          </Pressable>
        </View>

        {/* Project Assignments */}
        {userAssignments.length > 0 ? (
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Project Assignments ({userAssignments.length})
            </Text>
            <View className="space-y-2">
              {userAssignments.map((assignment) => {
                const project = projects.find(p => p.id === assignment.projectId);
                if (!project) return null;
                
                return (
                  <View key={assignment.projectId} className="flex-row items-center justify-between bg-gray-50 rounded-lg p-2">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {project.name}
                      </Text>
                      <View className={cn("inline-flex px-2 py-1 rounded border mt-1", getCategoryColor(assignment.category))}>
                        <Text className="text-xs font-medium">
                          {getCategoryLabel(assignment.category)}
                        </Text>
                      </View>
                    </View>
                    
                    <Pressable
                      onPress={() => handleRemoveUser(user.id, project.id, user.name, project.name)}
                      className="ml-2 p-1"
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <Text className="text-yellow-800 text-sm">
              Not assigned to any projects
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Standard Header */}
      <StandardHeader 
        title="User Management"
      />

      <View className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Company Info Banner */}
        {currentCompany && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="business" size={16} color="#3b82f6" />
              <Text className="text-blue-900 font-medium ml-2 flex-1">
                {currentCompany.name}
              </Text>
            </View>
            <Text className="text-blue-700 text-xs mt-1">
              Showing users from your company only
            </Text>
          </View>
        )}

        {/* Admin Protection Notice */}
        {getAdminCountByCompany(currentUser.companyId) === 1 && (
          <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex-row">
            <Ionicons name="shield-checkmark" size={20} color="#d97706" />
            <View className="flex-1 ml-2">
              <Text className="text-amber-900 font-medium text-sm">Admin Protection Active</Text>
              <Text className="text-amber-700 text-xs mt-1">
                Your company must have at least one admin. Role changes and deletions are protected.
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar and Invite Button */}
        <View className="flex-row items-center mb-4 gap-2">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search-outline" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable
            onPress={() => setActiveModal('invite')}
            className="bg-green-600 rounded-lg px-4 py-2 flex-row items-center"
          >
            <Ionicons name="mail" size={18} color="white" />
            <Text className="text-white font-medium ml-1">Invite</Text>
          </Pressable>
        </View>

        <Text className="text-sm text-gray-600">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} in your company
        </Text>
      </View>

      {/* User List */}
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {filteredUsers.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              No Users Found
            </Text>
            <Text className="text-sm text-gray-600 text-center px-8 mb-6">
              {searchQuery 
                ? "No users match your search criteria"
                : "No users in your company yet. Invite team members to get started."
              }
            </Text>
            {!searchQuery && (
              <Pressable
                onPress={() => setActiveModal('invite')}
                className="bg-blue-600 rounded-lg px-6 py-3"
              >
                <Text className="text-white font-medium">Invite Users</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))
        )}
      </ScrollView>

      {/* Assignment Modal */}
      <Modal
        visible={activeModal === 'assign'}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <ModalHandle />
          
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setActiveModal(null)}
              className="mr-4"
            >
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Assign User to Project
            </Text>
            <Pressable
              onPress={handleAssignUser}
              disabled={!selectedUser || !selectedProject}
              className={cn(
                "px-4 py-2 rounded-lg",
                (!selectedUser || !selectedProject) ? "bg-gray-300" : "bg-blue-600"
              )}
            >
              <Text className="text-white font-medium">Assign</Text>
            </Pressable>
          </View>

          <ScrollView 
            className="flex-1 px-6 py-4"
            keyboardShouldPersistTaps="handled"
          >
            {selectedUser && (
              <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Selected User
                </Text>
                <Text className="text-base font-medium text-gray-900">
                  {selectedUser.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {selectedUser.email} • {selectedUser.role}
                </Text>
              </View>
            )}

            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Select Project
              </Text>
              <Pressable
                onPress={() => {
                  console.log("Project picker button pressed");
                  setActiveModal('project');
                }}
                className="border border-gray-300 rounded-lg bg-gray-50 p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className={selectedProject ? "text-gray-900" : "text-gray-500"}>
                    {selectedProject ? selectedProject.name : "Select a project..."}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </View>
              </Pressable>
            </View>

            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Select Category
              </Text>
              <Pressable
                onPress={() => {
                  console.log("Category picker button pressed");
                  setActiveModal('category');
                }}
                className="border border-gray-300 rounded-lg bg-gray-50 p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-900">
                    {getCategoryLabel(selectedCategory)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </View>
              </Pressable>

              <View className={cn("mt-3 p-3 rounded-lg border", getCategoryColor(selectedCategory))}>
                <Text className="text-sm font-medium">
                  Preview: {getCategoryLabel(selectedCategory)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Project Picker Modal */}
      <Modal
        visible={activeModal === 'project'}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <ModalHandle />
          
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setActiveModal('assign')}
              className="mr-4"
            >
              <Text className="text-blue-600 font-medium">Done</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Select Project
            </Text>
          </View>

          <ScrollView className="flex-1">
            {projects.length === 0 ? (
              <View className="p-6">
                <Text className="text-center text-gray-500">No projects available</Text>
              </View>
            ) : (
              projects.map((project) => (
                <Pressable
                  key={project.id}
                  onPress={() => {
                    setSelectedProject(project);
                    setActiveModal('assign');
                  }}
                  className={cn(
                    "flex-row items-center justify-between px-6 py-4 border-b border-gray-200",
                    selectedProject?.id === project.id ? "bg-blue-50" : "bg-white"
                  )}
                >
                  <Text className={cn(
                    "text-base",
                    selectedProject?.id === project.id ? "text-blue-600 font-semibold" : "text-gray-900"
                  )}>
                    {project.name}
                  </Text>
                  {selectedProject?.id === project.id && (
                    <Ionicons name="checkmark" size={24} color="#3b82f6" />
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={activeModal === 'category'}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <ModalHandle />
          
          <View className="flex-row items-center bg-white border-b border-gray-200 px-6 py-4">
            <Pressable 
              onPress={() => setActiveModal('assign')}
              className="mr-4"
            >
              <Text className="text-blue-600 font-medium">Done</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Select Category
            </Text>
          </View>

          <ScrollView className="flex-1">
            {(["lead_project_manager", "contractor", "subcontractor", "inspector", "architect", "engineer", "worker", "foreman"] as UserCategory[]).map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  setSelectedCategory(category);
                  setActiveModal('assign');
                }}
                className={cn(
                  "px-6 py-4 border-b border-gray-200",
                  selectedCategory === category ? "bg-blue-50" : "bg-white"
                )}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={cn(
                      "text-base",
                      selectedCategory === category ? "text-blue-600 font-semibold" : "text-gray-900"
                    )}>
                      {getCategoryLabel(category)}
                    </Text>
                    <View className={cn("inline-flex px-2 py-1 rounded border mt-2", getCategoryColor(category))}>
                      <Text className="text-xs font-medium">
                        {getCategoryLabel(category)}
                      </Text>
                    </View>
                  </View>
                  {selectedCategory === category && (
                    <Ionicons name="checkmark" size={24} color="#3b82f6" />
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={activeModal === 'success'}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={40} color="#10b981" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Success!</Text>
              <Text className="text-center text-gray-600">{successMessage}</Text>
            </View>
            <Pressable
              onPress={() => setActiveModal(null)}
              className="bg-blue-600 rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal
        visible={activeModal === 'removeConfirm'}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="warning" size={40} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Remove Assignment</Text>
              <Text className="text-center text-gray-600">
                Remove {removeData?.userName} from {removeData?.projectName}?
              </Text>
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setActiveModal(null);
                  setRemoveData(null);
                }}
                className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
              >
                <Text className="text-gray-900 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmRemoveUser}
                className="flex-1 bg-red-600 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold">Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}