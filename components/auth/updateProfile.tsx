"use client";

import React, { useState } from "react";
import { Button, Input, Form, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useGenericSubmitHandler } from "../form/genericSubmitHandler";
import { IUser } from "@/backend/models/user.model";
import toast from "react-hot-toast";
import { updateProfile } from "@/actions/auth.action";
import Loader from "../layout/Loader/Loader";


export default function UpdateProfile() {

    const { data: userData, update } = useSession() as {
    data: { user: IUser } | null;
    update: () => Promise<any>;
  };
    

 
     const [avatar, setAvatar] = useState("");
      const { handleSubmit, loading } = useGenericSubmitHandler(async (data) => {
    const bodyData = {
      name: data.name, 
      email: userData?.user?.email || "",
      avatar,
      oldAvatar: userData?.user?.profilePicture?.id,
    };
      const res = await updateProfile(bodyData);
      if (res?.error) {
        toast.error(res?.error?.message);
      }
      if(res?.updated){
        const updatesesssion = await update();
        if(updatesesssion){
         toast.success("Profile updated successfully");
       
        }
         
      }
    
  });

     const onchange : React.ChangeEventHandler<HTMLInputElement> = (e) =>{
        const file = Array.from(e.target.files || []);;
       
            const reader = new FileReader();
            reader.onloadend = () => {
                if(reader.readyState=== 2){
                setAvatar(reader.result as string);
            }};
            reader.readAsDataURL(file[0]);
        
     }
    if(userData=== undefined){
        return <Loader/>
    }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <div className="flex flex-col gap-1">
          <h1 className="text-large font-medium">Update Profile</h1>
          <p className="text-small text-default-500">
            Enter details to update profile
          </p>
        </div>

        <Form className="flex flex-col gap-5" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Name"
            name="name"
            placeholder="Enter your name"
            type="text"
            variant="bordered"
            defaultValue={ userData?.user?.name ?? ""}
          />

          <Input
            isRequired
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            isDisabled
            defaultValue={userData?.user?.email ?? ""}

          />

          <div className="flex gap-1 items-center">
            {avatar && <Avatar showFallback size="lg" radius="sm" src={avatar} />} 
            <Input
              label="Avatar"
              name="avatar"
              type="file"
              variant="bordered"
              onChange={onchange}
            />
          </div>

          <Button
            className="w-full"
            color="primary"
            type="submit"
            endContent={<Icon icon="akar-icons:arrow-right" />}
          >
            Update
          </Button>
        </Form>
      </div>
    </div>
  );
}