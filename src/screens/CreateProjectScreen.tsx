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
import { useProjectStore } from "../state/projectStore";
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
      <Text className="text-sm font-medium text-gray-700 mb-2">
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
          {/* Basic Information */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </Text>

            <InputField label="Project Name" error={errors.name}>
              <TextInput
                className={cn(
                  "border rounded-lg px-3 py-3 text-gray-900 bg-gray-50",
                  errors.name ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Enter project name"
                value={formData.name}
                onChangeText={handleNameChange}
                maxLength={100}
                autoCorrect={false}
                returnKeyType="next"
              />
            </InputField>

            <InputField label="Description" error={errors.description}>
              <TextInput
                className={cn(
                  "border rounded-lg px-3 py-3 text-gray-900 bg-gray-50",
                  errors.description ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Describe the project..."
                value={formData.description}
                onChangeText={handleDescriptionChange}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
                autoCorrect={false}
                returnKeyType="done"
              />
            </InputField>

            <InputField label="Status">
              <View className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <Picker.Item label="Planning" value="planning" />
                  <Picker.Item label="Active" value="active" />
                  <Picker.Item label="On Hold" value="on_hold" />
                  <Picker.Item label="Completed" value="completed" />
                  <Picker.Item label="Cancelled" value="cancelled" />
                </Picker>
              </View>
            </InputField>
          </View>

          {/* Timeline */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Timeline
            </Text>

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <InputField label="Start Date">
                  <Pressable
                    onPress={() => setShowStartDatePicker(true)}
                    className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-900">
                      {formData.startDate.toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </Pressable>
                </InputField>
              </View>

              <View className="flex-1">
                <InputField label="End Date" error={errors.endDate}>
                  <Pressable
                    onPress={() => setShowEndDatePicker(true)}
                    className={cn(
                      "border rounded-lg px-3 py-3 bg-gray-50 flex-row items-center justify-between",
                      errors.endDate ? "border-red-300" : "border-gray-300"
                    )}
                  >
                    <Text className="text-gray-900">
                      {formData.endDate.toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </Pressable>
                </InputField>
              </View>
            </View>

            <InputField label="Budget" required={false} error={errors.budget}>
              <TextInput
                className={cn(
                  "border rounded-lg px-3 py-3 text-gray-900 bg-gray-50",
                  errors.budget ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Enter budget amount"
                value={formData.budget}
                onChangeText={handleBudgetChange}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </InputField>
          </View>

          {/* Location */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </Text>

            <InputField label="Address" error={errors.address}>
              <TextInput
                className={cn(
                  "border rounded-lg px-3 py-3 text-gray-900 bg-gray-50",
                  errors.address ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Enter street address"
                value={formData.location.address}
                onChangeText={(text) => handleLocationChange("address", text)}
                autoCorrect={false}
                returnKeyType="next"
              />
            </InputField>

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <InputField label="City" error={errors.city}>
                  <TextInput
                    className={cn(
                      "border rounded-lg px-3 py-3 text-gray-900 bg-gray-50",
                      errors.city ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="City"
                    value={formData.location.city}
                    onChangeText={(text) => handleLocationChange("city", text)}
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </InputField>
              </View>

              <View className="flex-1">
                <InputField label="State" error={errors.state}>
                  <TextInput
                    className={cn(
                      "border rounded-lg px-3 py-3 text-gray-900 bg-gray-50",
                      errors.state ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="State"
                    value={formData.location.state}
                    onChangeText={(text) => handleLocationChange("state", text)}
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </InputField>
              </View>

              <View className="w-24">
                <InputField label="ZIP" required={false}>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-gray-50"
                    placeholder="ZIP"
                    value={formData.location.zipCode}
                    onChangeText={(text) => handleLocationChange("zipCode", text)}
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="next"
                  />
                </InputField>
              </View>
            </View>
          </View>

          {/* Client Information */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Client Information
            </Text>

            <InputField label="Client Name" error={errors.clientName}>
              <TextInput
                className={cn(
                  "border rounded-lg px-3 py-3 text-gray-900 bg-gray-50",
                  errors.clientName ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Enter client name"
                value={formData.clientInfo.name}
                onChangeText={(text) => handleClientChange("name", text)}
                autoCorrect={false}
                returnKeyType="next"
              />
            </InputField>

            <InputField label="Client Email" required={false}>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-gray-50"
                placeholder="Enter client email"
                value={formData.clientInfo.email}
                onChangeText={(text) => handleClientChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </InputField>

            <InputField label="Client Phone" required={false}>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900 bg-gray-50"
                placeholder="Enter client phone"
                value={formData.clientInfo.phone}
                onChangeText={(text) => handleClientChange("phone", text)}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </InputField>
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