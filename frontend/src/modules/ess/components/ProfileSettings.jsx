import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { personalInfoSchema } from "../../../core/utils/essValidation";
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

const ProfileSettings = ({ profile, onSubmit, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
  });

  console.log("🔥 Profile in form:", profile);

  // Load Profile Data in Form
  useEffect(() => {
    if (profile) {
      reset({
        // Contact Information (REAL FIELDS FROM BACKEND)
        email: profile.contactInfo?.email || "",
        phone: profile.contactInfo?.phoneNumber || "",
        alternatePhone: profile.contactInfo?.alternatePhone || "",

        // Address (your backend does NOT provide these — keep blank)
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          zipCode: profile.address?.zipCode || "",
          country: profile.address?.country || "",
        },

        // Emergency Contact (your backend does NOT provide these)
        emergencyContact: {
          name: profile.emergencyContact?.name || "",
          relationship: profile.emergencyContact?.relationship || "",
          phone: profile.emergencyContact?.phone || "",
        },
      });
    }
  }, [profile, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset(profile.personalInfo);
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* --- Edit Button / Save - Cancel --- */}
      <div className="flex justify-end mb-2">
        {!isEditing ? (
          <Button type="button" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" disabled {...register("email")} />
            </div>

            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                disabled={!isEditing}
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Alternate Phone</Label>
              <Input
                type="tel"
                disabled={!isEditing}
                {...register("alternatePhone")}
                className={errors.alternatePhone ? "border-red-500" : ""}
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
            {...register("address.street")}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="City"
              disabled={!isEditing}
              {...register("address.city")}
            />
            <Input
              placeholder="State"
              disabled={!isEditing}
              {...register("address.state")}
            />
            <Input
              placeholder="Zip Code"
              disabled={!isEditing}
              {...register("address.zipCode")}
            />
          </div>

          <Input
            placeholder="Country"
            disabled={!isEditing}
            {...register("address.country")}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {...register("emergencyContact.phone")}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ProfileSettings;
