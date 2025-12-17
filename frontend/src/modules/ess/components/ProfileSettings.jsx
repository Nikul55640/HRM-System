import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../shared/ui/card";
import { toast } from "react-toastify";

// Updated schema to match backend structure
const profileSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    nationality: z.string().optional(),
    bloodGroup: z.string().optional(),
    personalEmail: z.string().email().optional(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    alternatePhone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
});

const ProfileSettings = ({ profile, onSubmit, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  console.log("🔥 Profile in form:", profile);

  // Load Profile Data in Form
  useEffect(() => {
    if (profile) {
      reset({
        personalInfo: {
          firstName: profile.personalInfo?.firstName || "",
          lastName: profile.personalInfo?.lastName || "",
          dateOfBirth: profile.personalInfo?.dateOfBirth || "",
          gender: profile.personalInfo?.gender || "",
          maritalStatus: profile.personalInfo?.maritalStatus || "",
          nationality: profile.personalInfo?.nationality || "",
          bloodGroup: profile.personalInfo?.bloodGroup || "",
          personalEmail: profile.personalInfo?.personalEmail || "",
          phoneNumber: profile.personalInfo?.phoneNumber || "",
          alternatePhone: profile.personalInfo?.alternatePhone || "",
          address: {
            street: profile.personalInfo?.address?.street || "",
            city: profile.personalInfo?.address?.city || "",
            state: profile.personalInfo?.address?.state || "",
            zipCode: profile.personalInfo?.address?.zipCode || "",
            country: profile.personalInfo?.address?.country || "",
          },
        },
        emergencyContact: {
          name: profile.emergencyContact?.name || "",
          relationship: profile.emergencyContact?.relationship || "",
          phoneNumber: profile.emergencyContact?.phoneNumber || "",
          email: profile.emergencyContact?.email || "",
        },
      });
    }
  }, [profile, reset]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset form to original profile data
    if (profile) {
      reset({
        personalInfo: {
          firstName: profile.personalInfo?.firstName || "",
          lastName: profile.personalInfo?.lastName || "",
          dateOfBirth: profile.personalInfo?.dateOfBirth || "",
          gender: profile.personalInfo?.gender || "",
          maritalStatus: profile.personalInfo?.maritalStatus || "",
          nationality: profile.personalInfo?.nationality || "",
          bloodGroup: profile.personalInfo?.bloodGroup || "",
          personalEmail: profile.personalInfo?.personalEmail || "",
          phoneNumber: profile.personalInfo?.phoneNumber || "",
          alternatePhone: profile.personalInfo?.alternatePhone || "",
          address: {
            street: profile.personalInfo?.address?.street || "",
            city: profile.personalInfo?.address?.city || "",
            state: profile.personalInfo?.address?.state || "",
            zipCode: profile.personalInfo?.address?.zipCode || "",
            country: profile.personalInfo?.address?.country || "",
          },
        },
        emergencyContact: {
          name: profile.emergencyContact?.name || "",
          relationship: profile.emergencyContact?.relationship || "",
          phoneNumber: profile.emergencyContact?.phoneNumber || "",
          email: profile.emergencyContact?.email || "",
        },
      });
    }
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* --- Edit Button / Save - Cancel --- */}
      <div className="flex justify-end mb-2">
        {!isEditing ? (
          <Button type="button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                disabled={!isEditing}
                {...register("personalInfo.firstName")}
                className={errors.personalInfo?.firstName ? "border-red-500" : ""}
              />
              {errors.personalInfo?.firstName && (
                <p className="text-red-500 text-sm">{errors.personalInfo.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                disabled={!isEditing}
                {...register("personalInfo.lastName")}
                className={errors.personalInfo?.lastName ? "border-red-500" : ""}
              />
              {errors.personalInfo?.lastName && (
                <p className="text-red-500 text-sm">{errors.personalInfo.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                disabled={!isEditing}
                {...register("personalInfo.dateOfBirth")}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <select
                disabled={!isEditing}
                {...register("personalInfo.gender")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Marital Status</Label>
              <select
                disabled={!isEditing}
                {...register("personalInfo.maritalStatus")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input
                disabled={!isEditing}
                {...register("personalInfo.nationality")}
              />
            </div>

            <div className="space-y-2">
              <Label>Blood Group</Label>
              <select
                disabled={!isEditing}
                {...register("personalInfo.bloodGroup")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Personal Email</Label>
              <Input
                type="email"
                disabled={!isEditing}
                {...register("personalInfo.personalEmail")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                disabled={!isEditing}
                {...register("personalInfo.phoneNumber")}
                className={errors.personalInfo?.phoneNumber ? "border-red-500" : ""}
              />
              {errors.personalInfo?.phoneNumber && (
                <p className="text-red-500 text-sm">{errors.personalInfo.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Alternate Phone</Label>
              <Input
                type="tel"
                disabled={!isEditing}
                {...register("personalInfo.alternatePhone")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>Your current residence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Street Address"
            disabled={!isEditing}
            {...register("personalInfo.address.street")}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="City"
              disabled={!isEditing}
              {...register("personalInfo.address.city")}
            />
            <Input
              placeholder="State"
              disabled={!isEditing}
              {...register("personalInfo.address.state")}
            />
            <Input
              placeholder="Zip Code"
              disabled={!isEditing}
              {...register("personalInfo.address.zipCode")}
            />
          </div>

          <Input
            placeholder="Country"
            disabled={!isEditing}
            {...register("personalInfo.address.country")}
          />
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>Who should we call in emergency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              disabled={!isEditing}
              {...register("emergencyContact.name")}
            />
            <Input
              placeholder="Relationship"
              disabled={!isEditing}
              {...register("emergencyContact.relationship")}
            />
            <Input
              placeholder="Phone"
              disabled={!isEditing}
              type="tel"
              {...register("emergencyContact.phoneNumber")}
            />
            <Input
              placeholder="Email"
              disabled={!isEditing}
              type="email"
              {...register("emergencyContact.email")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Information (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>Your employment details (read-only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                value={profile?.employeeId || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={profile?.jobInfo?.jobTitle || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Input
                value={profile?.jobInfo?.employmentType || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Work Location</Label>
              <Input
                value={profile?.jobInfo?.workLocation || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input
                value={profile?.jobInfo?.joiningDate || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={profile?.status || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ProfileSettings;
