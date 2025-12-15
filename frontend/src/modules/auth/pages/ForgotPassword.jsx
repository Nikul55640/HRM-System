import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Lock, Building2 } from "lucide-react";
import { Button } from "../../../shared/ui/button";
import { Card, CardContent } from "../../../shared/ui/card";

const ForgotPassword = () => {

  return (
    <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
           <div className="max-w-md w-full">
             {/* Branding Header */}
     
             {/* Login Card */}
             <Card className="border-none shadow-2xl rounded-2xl bg-white">
               <CardContent className="pt-6">
                 <div className="text-center mb-8">
                   <div className="w-14 h-14 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                     <Building2 className="w-8 h-8 text-white" />
                   </div>
                   <h1 className="text-2xl font-bold text-gray-900">
                     Welcome Back!
                   </h1>
                   <p className="text-sm text-gray-600 mt-1">Sign in to continue</p>
                 </div>
                 <form  className="space-y-5">
                   {/* Email */}
                   <div>
                     <label className="text-sm text-gray-900 font-medium">
                       Email  Address
                     </label>
                     <div className="relative mt-1">
                       <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                       <input
                         type="email"
                         name="email"
                         placeholder="you@example.com"

                         className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                       />
                     </div>
                    
                   </div>

     
                  
     
                   {/* Submit Button */}
                   <Button
                     type="submit"
                     className="w-full h-11 text-base bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                   >
                     Reset Password
                   </Button>
                 </form>
               </CardContent>
             </Card>
           </div>
         </div>
    </>
  );
};

export default ForgotPassword;
