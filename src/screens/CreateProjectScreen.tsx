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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useAuthStore } from "../state/authStore";
import { useProjectStore } from "../state/projectStore.supabase";
import { useCompanyStore } from "../state/companyStore";
import { ProjectStatus } from "../types/buildtrack";
import { cn } from "../utils/cn";
import StandardHeader from "../components/StandardHeader";
import { notifyDataMutation } from "../utils/DataRefreshManager";

interface CreateProjectScreenProps {
  onNavigateBack: () => void;
}

export default function CreateProjectScreen({ onNavigateBack }: CreateProjectScreenProps) {
  const { user } = useAuthStore();
  const { createProject } = useProjectStore();
  const { getCompanyBanner } = useCompanyStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as ProjectStatus,
    startDate: new Date(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Default 6 months
    budget: "",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    clientInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== "admin") {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Project description is required";
    }

    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.location.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.location.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.clientInfo.name.trim()) {
      newErrors.clientName = "Client name is required";
    }

    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = "Budget must be a valid number";
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
      createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        budget: formData.budget ? Number(formData.budget) : undefined,
        location: formData.location,
        clientInfo: {
          name: formData.clientInfo.name,
          email: formData.clientInfo.email || undefined,
          phone: formData.clientInfo.phone || undefined,
        },
        createdBy: user.id,
        companyId: user.companyId,
      });

      // Notify all users about the new project
      notifyDataMutation('project');

      Alert.alert(
        "Project Created",
        "Project has been created successfully. You can now assign users to it.",
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
        "Failed to create project. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, description: text }));
  }, []);

  const handleBudgetChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, budget: text }));
  }, []);

  const handleLocationChange = useCallback((field: string, text: string) => {
    setFormData(prev => ({ 
      ...prev, 
      location: { ...prev.location, [field]: text } 
    }));
  }, []);

  const handleClientChange = useCallback((field: string, text: string) => {
    setFormData(prev => ({ 
      ...prev, 
      clientInfo: { ...prev.clientInfo, [field]: text } 
    }));
  }, []);

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
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      {children}
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Standard Header */}
      <StandardHeader 
        title="Create New Project"
        showBackButton={true}
        onBackPress={onNavigateBack}
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
          className="flex-1 px-4 py-3" 
          keyboardShouldPersistTaps="handled"
        >
          {/* Project Information */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Project Information</Text>
            
            <View className="space-y-4">
              {/* Project Name */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Project Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className={cn(
                    "border rounded-lg px-4 py-3 text-gray-900 bg-gray-50 text-lg",
                    errors.name ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="Enter project name"
                  value={formData.name}
                  onChangeText={handleNameChange}
                  maxLength={100}
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {errors.name && (
                  <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
                )}
              </View>

              {/* Description */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                <TextInput
                  className={cn(
                    "border rounded-lg px-4 py-3 text-gray-900 bg-gray-50 text-lg",
                    errors.description ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="Project description"
                  value={formData.description}
                  onChangeText={handleDescriptionChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                  autoCorrect={false}
                  returnKeyType="done"
                />
                {errors.description && (
                  <Text className="text-red-500 text-xs mt-1">{errors.description}</Text>
                )}
              </View>

              {/* Status */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Status</Text>
                
                {/* Custom Status Dropdown */}
                <Pressable
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex-row items-center justify-between"
                >
                  <Text className="text-gray-900 text-base capitalize">
                    {formData.status.replace("_", " ")}
                  </Text>
                  <Ionicons 
                    name={showStatusPicker ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </Pressable>
                
                {/* Status Dropdown Options */}
                {showStatusPicker && (
                  <View className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {["planning", "active", "on_hold", "completed", "cancelled"].map((status, index) => (
                      <Pressable
                        key={status}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, status: status as ProjectStatus }));
                          setShowStatusPicker(false);
                        }}
                        className={cn(
                          "px-4 py-3",
                          formData.status === status && "bg-blue-50",
                          index < 4 && "border-b border-gray-200"
                        )}
                      >
                          <Text className={cn(
                            "text-base capitalize",
                            formData.status === status ? "text-blue-900 font-medium" : "text-gray-900"
                          )}>
                          {status.replace("_", " ")}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Project Timeline */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Project Timeline</Text>
            
            <View className="space-y-5">
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Start Date</Text>
                  <Pressable
                    onPress={() => setShowStartDatePicker(true)}
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-900 text-base">
                      {formData.startDate.toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </Pressable>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Estimated End Date</Text>
                  <Pressable
                    onPress={() => setShowEndDatePicker(true)}
                    className={cn(
                      "border rounded-lg px-4 py-3 bg-gray-50 flex-row items-center justify-between",
                      errors.endDate ? "border-red-300" : "border-gray-300"
                    )}
                  >
                    <Text className="text-gray-900 text-base">
                      {formData.endDate.toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </Pressable>
                  {errors.endDate && (
                    <Text className="text-red-500 text-xs mt-1">{errors.endDate}</Text>
                  )}
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Budget</Text>
                <TextInput
                  className={cn(
                    "border rounded-lg px-4 py-3 text-gray-900 bg-gray-50 text-base",
                    errors.budget ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="Enter budget amount"
                  value={formData.budget}
                  onChangeText={handleBudgetChange}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
                {errors.budget && (
                  <Text className="text-red-500 text-xs mt-1">{errors.budget}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Location */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-3">Location</Text>
            
            <View>
              <TextInput
                className={cn(
                  "border rounded-lg px-4 py-3 text-gray-900 bg-gray-50 text-lg",
                  errors.address ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Enter full address (street, city, state/province, postal code, country)"
                value={formData.location.address}
                onChangeText={(text) => handleLocationChange("address", text)}
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
                autoCorrect={false}
                returnKeyType="default"
              />
              {errors.address && (
                <Text className="text-red-500 text-xs mt-1">{errors.address}</Text>
              )}
            </View>
          </View>

          {/* Client Information */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Client Information</Text>
            
            <View className="space-y-4">
              {/* Client Name */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Client Name</Text>
                <TextInput
                  className={cn(
                    "border rounded-lg px-4 py-3 text-gray-900 bg-gray-50 text-lg",
                    errors.clientName ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="Enter client name"
                  value={formData.clientInfo.name}
                  onChangeText={(text) => handleClientChange("name", text)}
                  maxLength={100}
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {errors.clientName && (
                  <Text className="text-red-500 text-xs mt-1">{errors.clientName}</Text>
                )}
              </View>

              {/* Client Email */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Client Email</Text>
                <TextInput
                  className={cn(
                    "border rounded-lg px-4 py-3 text-gray-900 bg-gray-50 text-lg",
                    errors.clientEmail ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="Enter client email"
                  value={formData.clientInfo.email}
                  onChangeText={(text) => handleClientChange("email", text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {errors.clientEmail && (
                  <Text className="text-red-500 text-xs mt-1">{errors.clientEmail}</Text>
                )}
              </View>

              {/* Client Phone */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Client Phone</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 text-lg"
                  placeholder="Enter client phone"
                  value={formData.clientInfo.phone}
                  onChangeText={(text) => handleClientChange("phone", text)}
                  keyboardType="phone-pad"
                  maxLength={20}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(_event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, startDate: selectedDate }));
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          minimumDate={formData.startDate}
          onChange={(_event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, endDate: selectedDate }));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}